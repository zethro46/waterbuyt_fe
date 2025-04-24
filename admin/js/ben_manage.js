// File: /admin/js/ben_manage.js
import CONFIG from '/admin/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api/stations`;
const token = localStorage.getItem('token');

let benData = [];
let editingId = null;

// Lấy danh sách bến
async function fetchBenList() {
  try {
    const res = await fetch(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    benData = await res.json();
    renderBenList();
  } catch (err) {
    console.error("Lỗi khi load danh sách bến:", err);
  }
}

// Hiển thị danh sách bến
function renderBenList() {
  const table = document.getElementById("benTable");
  const search = document.getElementById("searchInput").value.toLowerCase();
  table.innerHTML = "";
  benData
    .filter(b => b.name && b.name.toLowerCase().includes(search))
    .forEach((ben, index) => {
      table.innerHTML += `
        <tr class="border-t">
          <td class="py-2 px-4">${ben.name}</td>
          <td class="py-2 px-4">${ben.address}</td>
          <td class="py-2 px-4">${ben.status}</td>
          <td class="py-2 px-4">
            <button onclick="editBen(${index})" class="text-blue-500 mr-2">Sửa</button>
            <button onclick="deleteBen(${ben.id})" class="text-red-500">Xóa</button>
          </td>
        </tr>`;
    });
}

// Gửi form thêm/sửa
async function submitBen(e) {
  e.preventDefault();
  const ten = document.getElementById("tenBen").value;
  const diachi = document.getElementById("diaChi").value;
  const thutu = parseInt(document.getElementById("thuTu").value);

  const ben = {
    name: ten,
    address: diachi,
    status: thutu
  };

  try {
    const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ben)
    });

    document.getElementById("benForm").reset();
    editingId = null;
    await fetchBenList();
  } catch (err) {
    console.error("Lỗi khi lưu bến:", err);
  }
}

// Nhấn nút sửa
function editBen(index) {
  const ben = benData[index];
  document.getElementById("tenBen").value = ben.name;
  document.getElementById("diaChi").value = ben.address;
  document.getElementById("thuTu").value = ben.status;
  editingId = ben.id;
}

// Xoá bến
async function deleteBen(id) {
  if (!confirm("Bạn có chắc muốn xóa?")) return;

  try {
    await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    await fetchBenList();
  } catch (err) {
    console.error("Lỗi khi xóa bến:", err);
  }
}

// Gọi khi load trang
fetchBenList();
