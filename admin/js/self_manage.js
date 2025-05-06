 
// File: /admin/js/self_manage.js
import CONFIG from '/admin/js/setting.js';

const API_URL = `${CONFIG.BASE_URL}/api/staffs/1`;
const token = localStorage.getItem("token");

let originalData = {};

// Gọi API để hiển thị thông tin cá nhân
async function fetchProfile() {
  console.log("API URL:", API_URL); // kiểm tra nhanh
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Lỗi khi tải thông tin cá nhân");
    const data = await res.json();
    originalData = data;

    // Gán vào form
    document.getElementById("hoTen").value = data.fullName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("soDienThoai").value = data.phone || "";
    document.getElementById("diaChi").value = data.address || "";
    document.querySelector(".admin-name").textContent = data.fullName;
  } catch (err) {
    console.error("Lỗi khi lấy thông tin:", err);
    alert("Không thể tải thông tin cá nhân.");
  }
}

// Gửi thông tin cập nhật
async function submitProfile(e) {
  e.preventDefault();

  const payload = {
    fullName: document.getElementById("hoTen").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("soDienThoai").value,
    address: document.getElementById("diaChi").value,
    identityNumber: originalData.identityNumber || "",
    birthDate: originalData.birthDate || "2000-01-01",
    gender: originalData.gender || "Nam"
  };

  try {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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

// Gọi khi trang load
fetchProfile();
window.submitProfile = submitProfile;