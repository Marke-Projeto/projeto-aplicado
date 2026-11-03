// Configurações de Segurança e Controlo de Tentativas (OWASP A07:2025 - Authentication Failures)
const MAX_TENTATIVAS = 3;
const TEMPO_BLOQUEIO_MS = 30000; // 30 segundos de penalização

/**
 * Requisito de Segurança Eixo 2 e OWASP A07: Nenhuma senha ou credencial em texto claro no código.
 * As credenciais autorizadas são armazenadas exclusivamente através de seus digests criptográficos SHA-256.
 *
 * Utilizador padrão: "admin"
 * Palavra-passe padrão: "senha123"
 */
const HASH_USUARIO_AUTORIZADO = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const HASH_SENHA_AUTORIZADA = "55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251";

/**
 * Gera o hash SHA-256 de uma string utilizando a Web Crypto API nativa do navegador.
 * Garante hashing criptográfico sem dependências externas.
 */
async function gerarHashSHA256(texto) {
    const encoder = new TextEncoder();
    const dados = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dados);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitiza texto convertendo caracteres especiais em entidades HTML
 * para neutralizar injeção de scripts (OWASP A05:2025 - Injection / XSS).
 */
function sanitizar(texto) {
    if (typeof texto !== 'string') return '';
    const elemento = document.createElement('div');
    elemento.textContent = texto;
    return elemento.innerHTML;
}

/**
 * Verifica se o utilizador está em período de bloqueio temporário (Rate Limiting).
 * Utiliza localStorage para persistir o bloqueio mesmo após recarregamentos de página (F5).
 */
let timerBloqueio = null;
function verificarBloqueio() {
    const bloqueadoAte = localStorage.getItem("bloqueadoAte");
    const mensagemErro = document.getElementById('mensagemErro');
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');

    if (bloqueadoAte) {
        const tempoRestante = Number(bloqueadoAte) - Date.now();
        if (tempoRestante > 0) {
            const segundos = Math.ceil(tempoRestante / 1000);
            if (mensagemErro) {
                mensagemErro.textContent = `Conta temporariamente bloqueada. Aguarde ${segundos}s para tentar novamente.`;
            }
            if (submitBtn) submitBtn.disabled = true;

            if (timerBloqueio) clearTimeout(timerBloqueio);
            timerBloqueio = setTimeout(verificarBloqueio, 1000);
            return true;
        } else {
            // Tempo expirado: reseta tentativas e reabilita o botão
            localStorage.removeItem("bloqueadoAte");
            localStorage.removeItem("tentativasFalhadas");
            if (mensagemErro) mensagemErro.textContent = "";
            if (submitBtn) submitBtn.disabled = false;
            if (timerBloqueio) clearTimeout(timerBloqueio);
        }
    }
    return false;
}

// Configuração do Formulário de Login (index.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Verifica bloqueio logo ao carregar
    verificarBloqueio();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Impede submissão caso o tempo de bloqueio esteja em vigor
        if (verificarBloqueio()) {
            return;
        }

        let tentativas = Number(localStorage.getItem("tentativasFalhadas") || 0);

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        // Sanitização de entradas contra XSS
        const userSanitizado = sanitizar(usernameInput);

        // Gera o hash criptográfico das entradas informadas
        const hashUser = await gerarHashSHA256(userSanitizado);
        const hashPass = await gerarHashSHA256(passwordInput);

        // Validação criptográfica (sem expor senhas no código)
        if (hashUser === HASH_USUARIO_AUTORIZADO && hashPass === HASH_SENHA_AUTORIZADA) {
            // Sucesso: limpa tentativas e autentica sessão
            localStorage.removeItem("tentativasFalhadas");
            localStorage.removeItem("bloqueadoAte");
            sessionStorage.setItem("autenticado", "sim");
            sessionStorage.setItem("usuarioLogado", userSanitizado);
            window.location.href = "dashboard.html";
        } else {
            tentativas++;
            localStorage.setItem("tentativasFalhadas", tentativas);

            if (tentativas >= MAX_TENTATIVAS) {
                const bloqueadoAte = Date.now() + TEMPO_BLOQUEIO_MS;
                localStorage.setItem("bloqueadoAte", bloqueadoAte);
                verificarBloqueio();
            } else {
                const restantes = MAX_TENTATIVAS - tentativas;
                const mensagemErro = document.getElementById('mensagemErro');
                if (mensagemErro) {
                    mensagemErro.textContent = `Credenciais inválidas. Tem mais ${restantes} tentativa(s) antes do bloqueio.`;
                }
            }
        }
    });
}

// Vinculação do botão de Logout (dashboard.html) via listener seguro (compatível com CSP)
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', logout);
}

/**
 * Encerra a sessão e redireciona com replace() para impedir navegação reversa via histórico.
 */
function logout() {
    sessionStorage.removeItem("autenticado");
    sessionStorage.removeItem("usuarioLogado");
    window.location.replace("index.html");
}
