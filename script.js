document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // 1. Proteção da Página Interna (dashboard.html)
    if (path.includes("dashboard.html")) {
        if (sessionStorage.getItem("autenticado") !== "true") {
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

    // 2. Lógica de Login (index.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const passwordInput = document.getElementById("password").value;
            const messageElement = document.getElementById("message");

            // Função para gerar Hash SHA-256 via Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(passwordInput);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

            // Hash SHA-256 da senha 'Mkp64'
            const hashCorreto = "d36bf09121f062d1c68e3cc0090ffeb41327fb053b5faefdf1163473138b3017";

            if (hashHex === hashCorreto) {
                sessionStorage.setItem("autenticado", "true");
                window.location.href = "dashboard.html";
            } else {
                if (messageElement) {
                    messageElement.innerText = "Credenciais inválidas.";
                    messageElement.style.color = "red";
                }
            }
        });
    }
});
