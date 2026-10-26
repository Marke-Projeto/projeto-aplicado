# Projeto Aplicado - Práticas de Mercado

## Estrutura (Eixo 3)
Este repositório contém uma aplicação Web simples desenvolvida com HTML e JavaScript, contendo Login, Página Interna e Logout. O código foi gerado com o auxílio de IA.

## Mitigações de Segurança (OWASP Top 10)
Conforme exigido, foram mitigadas 3 vulnerabilidades do OWASP Top 10:2025 no ficheiro script.js:
1. Injeção (XSS): Função sanitizar() que converte caracteres especiais.
2. Falhas de Autenticação: Bloqueio após 3 tentativas falhadas.
3. Exposição de Dados: Mensagens de erro genéricas na falha de login.
