// File: /admin/js/boat_manage.js
import CONFIG from '/admin/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api/ships`;
const token = localStorage.getItem('token');

let boatData = [];
let editingId = null;

// Lấy danh sách tàu
async function fetchBoatList() {
  try {
    const res = await fetch(API_BASE_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    boatData = await res.json();
    renderBoatList();
  } catch (err) {
    console.error("Lỗi khi load danh sách tàu:", err);
  }
}

// Hiển thị danh sách
function renderBoatList() {
  const table = document.getElementById("boatTable");
  table.innerHTML = "";
  boatData.forEach((boat, index) => {
    table.innerHTML += `
      <tr class="border-t">
        <td class="py-2 px-4">${boat.name}</td>
        <td class="py-2 px-4">${boat.registrationNumber}</td>
        <td class="py-2 px-4">${boat.seatCapacity}</td>
        <td class="py-2 px-4">${boat.status}</td>
        <td class="py-2 px-4">
          <button onclick="editBoat(${index})" class="text-blue-500 mr-2">Sửa</button>
          <button onclick="deleteBoat(${boat.id})" class="text-red-500">Xóa</button>
        </td>
      </tr>`;
  });
}

// Gửi form thêm/sửa tàu
async function submitBoat(e) {
  e.preventDefault();
  const name = document.getElementById("tenTau").value;
  const registration_number = document.getElementById("soHieu").value;
  const seat_capacity = parseInt(document.getElementById("soLuongGhe").value);
  const status = document.getElementById("trangThai").value;

  const boat = { name, registration_number, seat_capacity, status };

  try {
    const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(boat)
    });

    document.getElementById("boatForm").reset();
    editingId = null;
    await fetchBoatList();
  } catch (err) {
    console.error("Lỗi khi lưu tàu:", err);
  }
}

// Chọn sửa
function editBoat(index) {
  const boat = boatData[index];
  document.getElementById("tenTau").value = boat.name;
  document.getElementById("soHieu").value = boat.registration_number;
  document.getElementById("soLuongGhe").value = boat.seat_capacity;
  document.getElementById("trangThai").value = boat.status;
  editingId = boat.id;
}

// Xoá tàu
async function deleteBoat(id) {
  if (!confirm("Bạn có chắc muốn xóa tàu này?")) return;
  try {
    await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchBoatList();
  } catch (err) {
    console.error("Lỗi khi xóa tàu:", err);
  }
}

// Load ban đầu
fetchBoatList();
