# Projeto Aplicado - Práticas de Mercado

## Estrutura (Eixo 3)

Este repositório contém uma aplicação Web desenvolvida com **HTML5, CSS3 e JavaScript puro**, simulando um ambiente seguro de mercado (*Secure by Design* e *Secure by Default*). O fluxo contempla Login seguro, Área Interna Restrita (Dashboard) e Logout funcional, com controles de integridade, proteção de dados e validações implementadas no cliente conforme os critérios do Eixo 3. O código foi desenvolvido e auditado com o auxílio da IDE **Google Antigravity**.

---

## Mitigações de Segurança (OWASP Top 10:2025)

Conforme exigido pelas diretrizes do projeto, foram implementadas mitigações para 3 vulnerabilidades do documento oficial do **OWASP Top 10:2025**:

### 1. A01:2025 - Broken Access Control (Quebra de Controle de Acesso)
* **Problema mitigado:** Acesso direto e não autorizado à área restrita (`dashboard.html`) por manipulação de URL, histórico de navegação ou cache do navegador.
* **Implementação no código:**
  * **Guarda no Cabeçalho (`<head>` em `dashboard.html`):** Verificação imediata da chave de sessão (`sessionStorage.getItem("autenticado") !== "sim"`) antes da renderização do DOM.
  * **Ocultação Preventiva do Conteúdo:** O corpo da página é configurado com `display: none` por padrão no CSS, sendo exibido via JavaScript apenas após a confirmação da sessão válida, impedindo vazamento de interface (*flash of unauthenticated content*).
  * **Logout Seguro com `window.location.replace()`:** A função `logout()` revoga a sessão (`removeItem`) e substitui a entrada no histórico de navegação, impedindo que o utilizador volte ao painel autenticado utilizando o botão "Voltar" do navegador.

### 2. A05:2025 - Injection (Injeção / Cross-Site Scripting - XSS)
* **Problema mitigado:** Execução de scripts maliciosos injetados através de campos de formulário e manipulação insegura de elementos no DOM.
* **Implementação no código:**
  * **Política de Segurança de Conteúdo (CSP):** Declaração de cabeçalhos `<meta http-equiv="Content-Security-Policy">` em todas as páginas, restringindo a execução de fontes externas e scripts não autorizados (`default-src 'self'`).
  * **Sanitização de Entidades HTML (`script.js`):** Função `sanitizar()` que converte caracteres de controle (`<`, `>`, `"`, `&`) em suas entidades HTML correspondentes, neutralizando a injeção de tags executáveis.
  * **Manipulação Segura do DOM (`textContent`):** Renderização de mensagens dinâmicas e dados do utilizador estritamente através da propriedade `textContent`, garantindo que qualquer dado seja tratado como texto plano pelo motor do navegador e nunca como código HTML interpretável.

### 3. A07:2025 - Identification and Authentication Failures (Falhas de Identificação e Autenticação)
* **Problema mitigado:** Ataques de força bruta (*brute force*), enumeração de utilizadores (*User Enumeration*) e vazamento de credenciais no código-fonte.
* **Implementação no código:**
  * **Conformidade Estrita com o Eixo 2 (Sem senhas hardcoded):** Nenhuma credencial em texto claro é armazenada no código-fonte. A verificação é realizada calculando o digest criptográfico **SHA-256** em tempo real através da **Web Crypto API** nativa (`crypto.subtle.digest`) e comparando com os hashes esperados.
  * **Rate Limiting Persistente (`localStorage`):** Ao atingir 3 tentativas consecutivas incorretas, o sistema aplica um bloqueio temporário de 30 segundos. O estado e o *timestamp* de expiração são gravados no `localStorage`, impedindo que o atacante contorne o bloqueio recarregando a página (F5).
  * **Contador Regressivo e Feedback Seguro:** Durante o bloqueio, o botão de submissão é desativado e um contador regressivo em tempo real é exibido. Mensagens de erro neutras (*"Credenciais inválidas"*) impedem a descoberta de se o erro ocorreu no utilizador ou na senha.

---

## Credenciais de Demonstração

Para fins de teste e avaliação da aplicação:
* **Utilizador:** `admin`
* **Palavra-passe:** `senha123`
