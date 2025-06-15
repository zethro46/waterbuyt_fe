import CONFIG from "./setting.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-login").addEventListener("click", handleLogin);
});

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const userError = document.getElementById("userError");
  const passError = document.getElementById("passError");
  const loginError = document.getElementById("loginError");

  userError.style.display = username ? "none" : "block";
  passError.style.display = password ? "none" : "block";
  loginError.style.display = "none";

  if (!username || !password) return;

  fetch(`${CONFIG.BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.id);
        window.location.href = "pages/dashboard.html";
      } else {
        loginError.innerText = data.message || "Đăng nhập thất bại";
        loginError.style.display = "block";
      }
    })
    .catch(err => {
      loginError.innerText = "Lỗi kết nối đến server!";
      loginError.style.display = "block";
    });
}
