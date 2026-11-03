// Configurações de Segurança e Controlo de Tentativas (OWASP A07:2025)
const MAX_TENTATIVAS = 3;
const TEMPO_BLOQUEIO_MS = 30000; // 30 segundos de penalização

const HASH_USUARIO_AUTORIZADO = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const HASH_SENHA_AUTORIZADA = "55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251";

async function gerarHashSHA256(texto) {
    const encoder = new TextEncoder();
    const dados = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dados);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function sanitizar(texto) {
    if (typeof texto !== 'string') return '';
    const elemento = document.createElement('div');
    elemento.textContent = texto;
    return elemento.innerHTML;
}

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
                mensagemErro.textContent = `Conta temporariamente bloqueada. Aguarde ${segundos}s.`;
                mensagemErro.style.color = "red";
            }
            if (submitBtn) submitBtn.disabled = true;

            if (timerBloqueio) clearTimeout(timerBloqueio);
            timerBloqueio = setTimeout(verificarBloqueio, 1000);
            return true;
        } else {
            localStorage.removeItem("bloqueadoAte");
            localStorage.removeItem("tentativasFalhadas");
            if (mensagemErro) mensagemErro.textContent = "";
            if (submitBtn) submitBtn.disabled = false;
            if (timerBloqueio) clearTimeout(timerBloqueio);
        }
    }
    return false;
}

// Envolvemos tudo no DOMContentLoaded para garantir que o HTML carregou
document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // --- A01:2025 - Controle de Acesso e Ocultação no Dashboard ---
    if (path.includes("dashboard.html")) {
        if (sessionStorage.getItem("autenticado") !== "sim") {
            window.location.replace("index.html");
            return;
        } else {
            // Mostra o corpo da página apenas se estiver autenticado
            document.body.style.display = "flex";
        }

        // Vinculação do botão de Logout (CORRIGIDO para "logoutBtn" que está no seu HTML)
        const btnLogout = document.getElementById('logoutBtn');
        if (btnLogout) {
            btnLogout.addEventListener('click', logout);
        }
    }

    // --- A07:2025 - Autenticação & Rate Limiting no Login ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        verificarBloqueio();

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (verificarBloqueio()) return;

            let tentativas = Number(localStorage.getItem("tentativasFalhadas") || 0);

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value;
            const userSanitizado = sanitizar(usernameInput);

            const hashUser = await gerarHashSHA256(userSanitizado);
            const hashPass = await gerarHashSHA256(passwordInput);

            if (hashUser === HASH_USUARIO_AUTORIZADO && hashPass === HASH_SENHA_AUTORIZADA) {
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
                        mensagemErro.style.color = "red";
                    }
                }
            }
        });
    }
});

function logout() {
    sessionStorage.removeItem("autenticado");
    sessionStorage.removeItem("usuarioLogado");
    window.location.replace("index.html");
}
