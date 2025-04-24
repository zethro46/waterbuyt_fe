// File: /admin/js/ticket_manage.js
import CONFIG from '/admin/js/setting.js';

const API_BASE_URL = `${CONFIG.apiBaseUrl}/api/tickets`;
const token = localStorage.getItem('token');
let ticketData = [];

// Gọi API lấy danh sách vé
async function fetchTickets() {
  try {
    const res = await fetch(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Không thể tải dữ liệu vé!");

    const rawTickets = await res.json();

    // Chuyển đổi dữ liệu để dùng trong giao diện
    ticketData = rawTickets.map(ticket => ({
      nguoiDat: ticket.customerName,
      ngayDat: new Date(ticket.bookingTime).toLocaleString('vi-VN'),
      diemDi: `Bến ${ticket.startStationId}`,
      diemDen: `Bến ${ticket.endStationId}`,
      ghe: ticket.seatQuantity,
      thanhToan: ticket.paymentMethod
    }));

    renderTickets();
  } catch (err) {
    console.error("Lỗi khi tải vé:", err);
    document.getElementById("ticketTable").innerHTML = `<tr><td colspan="6" class="text-red-500 p-4">${err.message}</td></tr>`;
  }
}

// Hiển thị bảng vé
function renderTickets() {
  const table = document.getElementById("ticketTable");
  table.innerHTML = "";
  ticketData.forEach((ticket, index) => {
    table.innerHTML += `
      <tr class="border-t">
        <td class="py-2 px-4">${ticket.nguoiDat}</td>
        <td class="py-2 px-4">${ticket.ngayDat}</td>
        <td class="py-2 px-4">${ticket.diemDi}</td>
        <td class="py-2 px-4">${ticket.diemDen}</td>
        <td class="py-2 px-4">${ticket.ghe}</td>
        <td class="py-2 px-4">${ticket.thanhToan}</td>
        <td class="py-2 px-4">
          <button onclick="showDetail(${index})" class="text-blue-600">Xem</button>
        </td>
      </tr>`;
  });
}

// Xem chi tiết vé
function showDetail(index) {
  const ticket = ticketData[index];
  document.getElementById("detailNguoiDat").textContent = ticket.nguoiDat;
  document.getElementById("detailNgayDat").textContent = ticket.ngayDat;
  document.getElementById("detailDiemDi").textContent = ticket.diemDi;
  document.getElementById("detailDiemDen").textContent = ticket.diemDen;
  document.getElementById("detailGhe").textContent = ticket.ghe;
  document.getElementById("detailThanhToan").textContent = ticket.thanhToan;

  document.getElementById("ticketDetail").classList.remove("hidden");
}

// Load lần đầu
fetchTickets();

// Cho HTML gọi được
window.showDetail = showDetail;
