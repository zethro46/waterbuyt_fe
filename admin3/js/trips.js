let currentStatus = "";
let currentDate = "";

function loadTrips() {
  const table = $('#tripTable').DataTable();
  table.clear().draw();

  let url = "http://127.0.0.1:8080/api/trips";
  const params = new URLSearchParams();

  if (currentStatus) params.append("status", currentStatus);
  if (currentDate) params.append("date", currentDate);

  if (params.toString()) {
    url += "?" + params.toString();
  }

  fetch(url, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
    .then(res => {
      if (!res.ok) throw new Error("Lỗi HTTP: " + res.status);
      return res.json();
    })
    .then(data => {
      data.forEach(trip => {
        const time = `${trip.startTime}`;
        const route = `${trip.startStation} → ${trip.endStation}`;
        const ship = `Tàu Titanic ${trip.shipId}`;
        const status = mapStatus(trip.status);
        let actions = "";

        const rawStatus = trip.status?.toUpperCase();
        if (rawStatus === "PENDING" || rawStatus === "IN_PROGRESS") {
          actions = `<button class="btn btn-sm btn-danger btn-cancel">Hủy</button>`;
        }

        const row = table.row.add([time,trip.departureDate,route, ship, status, actions]).draw(false).node();
        $(row).find('.btn-cancel').attr('data-id', trip.id); // ✅ fix data-id bị mất
      });
    })
    .catch(err => {
      console.error("Lỗi khi load danh sách chuyến đi:", err);
      alert("Không thể tải danh sách chuyến đi: " + err.message);
    });
}

function mapStatus(status) {
  const s = status?.toUpperCase();
  return {
    PENDING: "Đang chờ",
    IN_PROGRESS: "Đang đi",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy"
  }[s] || status;
}

$(document).ready(function () {
  $('#tripTable').DataTable();

  const today = new Date().toISOString().split("T")[0];
  $('#generateDate').attr('min', today);

  loadTrips();

  $('.filter-btn').click(function () {
    $('.filter-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    $(this).removeClass('btn-outline-primary').addClass('btn-primary');
    currentStatus = $(this).data('status');
    loadTrips();
  });

  $('#btnFilterDate').click(function () {
    const selectedDate = $('#filterDate').val();
    if (!selectedDate) {
      alert("Vui lòng chọn ngày để lọc!");
      return;
    }
    currentDate = selectedDate;
    loadTrips();
  });

  $('#btnClearDate').click(function () {
    $('#filterDate').val("");
    currentDate = "";
    loadTrips();
  });

  $('#tripTable tbody').on('click', '.btn-cancel', function () {
    const tripId = $(this).attr('data-id');
    console.log("Trip ID clicked:", tripId); // kiểm tra
    $('#cancelTripId').val(tripId);
    $('#cancelReason').val("");
    $('#cancelModal').modal('show');
  });

  $('#cancelForm').submit(function (e) {
    e.preventDefault();
    const tripId = $('#cancelTripId').val();
    const reason = $('#cancelReason').val();

    fetch(`http://127.0.0.1:8080/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ reason: reason })
    })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        $('#cancelModal').modal('hide');
        loadTrips();
      })
      .catch(err => {
        console.error("Hủy chuyến thất bại", err);
        alert("Không thể hủy chuyến");
      });
  });

  $('#generateForm').submit(function (e) {
    e.preventDefault();
    const selectedDate = $('#generateDate').val();
    if (!selectedDate) return alert("Vui lòng chọn ngày hợp lệ!");

    fetch(`http://127.0.0.1:8080/api/trips/generate-daily?date=${selectedDate}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(msg => {
            throw new Error(msg);
          });
        }
        return res.text();
      })
      .then(msg => {
        alert(msg);
        $('#generateModal').modal('hide');
        loadTrips();
      })
      .catch(err => {
        console.error("Lỗi khi tạo chuyến:", err);
        alert(err.message || "Không thể tạo chuyến hôm nay");
      });
  });
});

  // ✅ Gọi 2 API cập nhật trạng thái khi admin bấm nút
  $('#btnUpdateTripStatus').click(async function () {
    try {
      const token = localStorage.getItem("token");
      const headers = { 'Authorization': 'Bearer ' + token };

      // Gọi API cập nhật PENDING → IN_PROGRESS
      const res1 = await fetch("http://127.0.0.1:8080/api/trips/update-to-in-progress", {
        method: "PATCH", headers
      });
      const msg1 = await res1.text();

      // Gọi API cập nhật PENDING/IN_PROGRESS → COMPLETED
      const res2 = await fetch("http://127.0.0.1:8080/api/trips/auto-complete", {
        method: "PATCH", headers
      });
      const msg2 = await res2.text();

      alert(`${msg1}\n${msg2}`);
      loadTrips(); // Reload lại bảng
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái chuyến:", err);
      alert("Không thể cập nhật trạng thái chuyến!");
    }
  });


$('#manualTripModal').on('show.bs.modal', function () {
  const today = new Date().toISOString().split("T")[0];
  $('#manualDate').attr('min', today);
  $('#manualDate').val('');
  $('#manualTime').val('');
  $('#manualTime').removeAttr('min');

  $('#manualDate').off('change').on('change', function () {
    const selectedDate = $(this).val();
    const now = new Date();

    if (selectedDate === today) {
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const minTime = `${currentHour}:${currentMinute}`;
      $('#manualTime').attr('min', minTime);
    } else {
      $('#manualTime').removeAttr('min');
    }
  });

  const select = $('#shipSelect');
  select.empty();

  fetch('http://127.0.0.1:8080/api/ships', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      data.forEach(ship => {
        const option = document.createElement('option');
        option.value = ship.id;
        option.textContent = ship.name;
        select.append(option);
      });
    })
    .catch(err => {
      console.error("Lỗi khi load tàu:", err);
      alert("Không thể load danh sách tàu");
    });
});

$('#manualTripForm').submit(function (e) {
  e.preventDefault();

  const body = {
    routeId: $('#routeSelect').val(),
    shipId: $('#shipSelect').val(),
    departureDate: $('#manualDate').val(),
    departureTime: $('#manualTime').val()
  };

  fetch('http://127.0.0.1:8080/api/trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify(body)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.text();
    })
    .then(msg => {
      alert(msg);
      $('#manualTripModal').modal('hide');
      loadTrips();
    })
    .catch(err => {
      console.error("Tạo chuyến thất bại", err);
      alert(err.message || "Không thể tạo chuyến");
    });
});
