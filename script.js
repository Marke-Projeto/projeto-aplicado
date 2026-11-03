// Sanitização de entradas para prevenção de XSS (A05:2025)
function sanitizar(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // --- A01:2025 - Controle de Acesso no Dashboard ---
    if (path.includes("dashboard.html")) {
        if (sessionStorage.getItem("autenticado") !== "sim") {
            window.location.replace("index.html");
            return;
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                sessionStorage.removeItem("autenticado");
                window.location.replace("index.html");
            });
        }
    }

    // --- A07:2025 - Autenticação & Rate Limiting no Login ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const submitBtn = document.getElementById("submitBtn");
        const messageElement = document.getElementById("message");

        // Verifica bloqueio por Rate Limiting (localStorage)
        function verificarBloqueio() {
            const lockUntil = localStorage.getItem("lockUntil");
            if (lockUntil) {
                const now = Date.now();
                const remaining = Math.ceil((parseInt(lockUntil) - now) / 1000);

                if (remaining > 0) {
                    submitBtn.disabled = true;
                    messageElement.textContent = `Muitas tentativas. Aguarde ${remaining}s.`;
                    setTimeout(verificarBloqueio, 1000);
                    return true;
                } else {
                    localStorage.removeItem("lockUntil");
                    localStorage.setItem("tentativas", "0");
                    submitBtn.disabled = false;
                    messageElement.textContent = "";
                }
            }
            return false;
        }

        verificarBloqueio();

        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (verificarBloqueio()) return;

            const passwordInput = document.getElementById("password").value;

            // Cálculo do Hash SHA-256
            const encoder = new TextEncoder();
            const data = encoder.encode(passwordInput);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

            // Hash da senha 'Mkp64'
            const hashCorreto = "d36bf09121f062d1c68e3cc0090ffeb41327fb053b5faefdf1163473138b3017";

            if (hashHex === hashCorreto) {
                localStorage.setItem("tentativas", "0");
                sessionStorage.setItem("autenticado", "sim");
                window.location.href = "dashboard.html";
            } else {
                let tentativas = parseInt(localStorage.getItem("tentativas") || "0") + 1;
                localStorage.setItem("tentativas", tentativas.toString());

                if (tentativas >= 3) {
                    const lockTime = Date.now() + 30000; // 30 segundos
                    localStorage.setItem("lockUntil", lockTime.toString());
                    verificarBloqueio();
                } else {
                    messageElement.textContent = "Credenciais inválidas.";
                    messageElement.style.color = "red";
                }
            }
        });
    }
});
