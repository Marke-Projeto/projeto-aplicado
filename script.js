let tentativasFalhadas = 0;

function sanitizar(texto) {
    const elemento = document.createElement('div');
    elemento.innerText = texto;
    return elemento.innerHTML;
}

const loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (tentativasFalhadas >= 3) {
            document.getElementById('mensagemErro').innerText = "Conta temporariamente bloqueada devido a múltiplas tentativas.";
            return;
        }

        const user = sanitizar(document.getElementById('username').value);
        const pass = sanitizar(document.getElementById('password').value);

        if (user === "admin" && pass === "senha123") {
            sessionStorage.setItem("autenticado", "sim");
            window.location.href = "dashboard.html";
        } else {
            tentativasFalhadas++;
            document.getElementById('mensagemErro').innerText = "Credenciais inválidas. Tente novamente.";
        }
    });
}

function logout() {
    sessionStorage.removeItem("autenticado");
    window.location.href = "index.html";
}
