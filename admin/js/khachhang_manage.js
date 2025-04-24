// File: /admin/js/customer_manage.js
import CONFIG from '/admin/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api/admin/customers`;
const token = localStorage.getItem('token');
let khData = [];

// Gọi API để lấy danh sách khách hàng
async function fetchCustomerList() {
  try {
    const res = await fetch(API_BASE_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    console.log("API response:", result);
    khData = Array.isArray(result) ? result : result.data || [];  // Bảo vệ chống lỗi
    renderKH();
  } catch (err) {
    console.error("Lỗi khi load khách hàng:", err);
  }
}


// Hiển thị danh sách khách hàng
function renderKH() {
  const table = document.getElementById("khTable");
  const search = document.getElementById("searchInput").value.toLowerCase();
  table.innerHTML = "";

  khData
    .filter(kh =>
      kh.fullName?.toLowerCase().includes(search) ||
      kh.email?.toLowerCase().includes(search) ||
      kh.phone?.includes(search)
    )
    .forEach(kh => {
      table.innerHTML += `
        <tr class="border-t">
          <td class="py-2 px-4">${kh.fullName}</td>
          <td class="py-2 px-4">${kh.birthYear}</td>
          <td class="py-2 px-4">${kh.phone}</td>
          <td class="py-2 px-4">${kh.email}</td>
          <td class="py-2 px-4">${kh.gender === 'Male' ? 'Nam' : 'Nữ'}</td>
          <td class="py-2 px-4">${kh.nationality}</td>
        </tr>`;
    });
}

// Gọi khi load trang
fetchCustomerList();
