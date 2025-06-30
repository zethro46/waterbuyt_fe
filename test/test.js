import CONFIG from '/common/js/setting.js';

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "Đang đăng nhập...";

    const API_BASE_URL = `${CONFIG.BASE_URL}/api/admin/login`;

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `<span style="color:green;">${data.message}</span><br><br>Token:<br><small>${data.token}</small>`;
        } else {
            resultDiv.innerHTML = `<span style="color:red;">${data.message || "Đăng nhập thất bại"}</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span style="color:red;">Lỗi kết nối API!</span>`;
        console.error(error);
    }
});
