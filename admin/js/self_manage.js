// File: /admin/js/self_manage.js
import CONFIG from '/admin/js/setting.js';

const API_URL = `${CONFIG.apiBaseUrl}/api/staffs/1`;
const token = localStorage.getItem("token");

// Gọi API để hiển thị thông tin cá nhân
async function fetchProfile() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("API URL:", API_URL);

    if (!res.ok) throw new Error("Lỗi khi tải thông tin cá nhân");
    const data = await res.json();

    // Điền dữ liệu vào form
    document.getElementById("hoTen").value = data.fullName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("soDienThoai").value = data.phone || "";
    document.getElementById("diaChi").value = data.address || "";

    // (Tùy chọn) Cập nhật tên bên avatar
    document.querySelector(".admin-name").textContent = data.fullName;

  } catch (err) {
    console.error("Lỗi khi lấy thông tin:", err);
  }
}

// Gửi form cập nhật
async function submitProfile(e) {
  e.preventDefault();

  const payload = {
    fullName: document.getElementById("hoTen").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("soDienThoai").value,
    address: document.getElementById("diaChi").value,
    // Mặc định các thông tin phụ bạn có thể lưu từ lần đầu fetch hoặc thêm input nếu cần:
    identityNumber: "123456789",
    birthDate: "1990-01-01",
    gender: "Nam"
  };

  try {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Cập nhật thất bại!");

    const updated = await res.json();
    alert("Cập nhật thành công!");
    document.querySelector(".admin-name").textContent = updated.fullName;

  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    alert("Cập nhật thất bại!");
  }
}

// Gọi ngay khi load trang
fetchProfile();

// Cho phép gọi từ HTML
window.submitProfile = submitProfile;
