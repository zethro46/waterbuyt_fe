let currentDate = "";
let dataTable;

const stationNames = {
  1: "Bạch Đằng",
  2: "Thủ Thiêm",
  3: "Bình An",
  4: "Thanh Đa",
  5: "Hiệp Bình Chánh",
  6: "Linh Đông"
};

function viewDetailBtn(ticketId) {
   return `<button class="btn btn-sm btn-success btn-view-detail" data-id="${ticketId}">Xem chi tiết</button>`;
}

function loadTickets() {
  if (!dataTable) {
    dataTable = $('#ticketTable').DataTable({
      ordering: false,
      pageLength: 10
    });
  }

  dataTable.clear().draw();

  let url = "http://127.0.0.1:8080/api/tickets";
  if (currentDate) {
    url += `/date?date=${currentDate}`;
  }

  fetch(url, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
    .then(res => {
      if (!res.ok) throw new Error("Lỗi HTTP: " + res.status);
      return res.json();
    })
    .then(data => {
  if (data.length === 0) {
    alert("Không có vé nào trong ngày đã chọn!");
    return;
  }

  data.forEach(ticket => {
    const startStation = stationNames[ticket.startStationId] || ticket.startStationId;
    const endStation = stationNames[ticket.endStationId] || ticket.endStationId;
    const bookingTime = new Date(ticket.bookingTime).toLocaleString("vi-VN");
    const depDate = ticket.departureDate || '';
    const depTime = ticket.startDepartureTime || '';
    const price = (ticket.price || 0).toLocaleString('vi-VN') + " đ";

    dataTable.row.add([
      ticket.idTicket,
      ticket.customerName,
      startStation,
      endStation,
      ticket.staffName,
      ticket.idTrip,
      depDate,
      depTime,
      ticket.seatQuantity,
      price,
      ticket.paymentMethod,
      bookingTime,
      viewDetailBtn(ticket.idTicket)
    ]);
  });

  dataTable.draw(false);
})

    .catch(err => {
      console.error("Lỗi khi load vé:", err);
      alert("Không thể tải danh sách vé: " + err.message);
    });
}

$(document).ready(function () {
  loadTickets();

  $('#btnFilterDate').click(function () {
    const selectedDate = $('#filterDate').val();
    if (!selectedDate) {
      alert("Vui lòng chọn ngày!");
      return;
    }
    currentDate = selectedDate;
    loadTickets();
  });

  $('#btnClearDate').click(function () {
    $('#filterDate').val("");
    currentDate = "";
    loadTickets();
  });

  // Xử lý nút xem chi tiết
  $('#ticketTable tbody').on('click', '.btn-view-detail', function () {
    const ticketId = $(this).data('id');

    fetch(`http://127.0.0.1:8080/api/tickets/details/${ticketId}`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => {
        const tbody = $("#ticketDetailBody");
        tbody.empty();

        data.forEach(info => {
          const seatIds = info.seatIds?.join(", ") || "";
const seatNumbers = info.seatNumbers?.join(", ") || "";
const row = `<tr>
  <td>${info.fullName}</td>
  <td>${info.birthYear}</td>
  <td>${seatIds}</td>
  <td>${seatNumbers}</td> <!-- ✅ ghế số hiệu -->
</tr>`;

          tbody.append(row);
        });

        $('#ticketDetailModal').modal('show');
      })
      .catch(err => {
        console.error("Lỗi khi lấy chi tiết vé:", err);
        alert("Không thể tải chi tiết vé");
      });
  });
});
