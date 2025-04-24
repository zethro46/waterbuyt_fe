import CONFIG from '/admin/js/setting.js';
let tripData = [];

function fetchTripsByStatus() {
    fetch(`${CONFIG.BASE_URL}/api/trips/status/Đang%20chờ`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Lỗi khi tải chuyến: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(data => {
        tripData = data.map(t => ({
          tuyen: t.routeId,
          tau: t.shipId,
          gio: t.departureTime,
          trangthai: t.status,
          tu: t.startStation,
          den: t.endStation
        }));
        renderTrips();
      })
      .catch(err => {
        console.error('Lỗi khi tải chuyến:', err);
        const table = document.getElementById("tripTable");
        table.innerHTML = `<tr><td colspan="6" class="text-red-500 p-4">${err.message}</td></tr>`;
      });
  }
  

  function generateTrips() {
    const date = document.getElementById("autoTripDate").value;
    const message = document.getElementById("generateMessage");
    message.textContent = "";
    if (!date) {
      message.textContent = "Vui lòng chọn ngày.";
      return;
    }
  
    fetch(`${CONFIG.BASE_URL}/api/trips/generate-daily?date=${date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => {
              throw new Error(text || "Đã tạo chuyến cho ngày này rồi.");
            });
          }
          return res.text(); // nếu server chỉ trả chuỗi
        })
        .then(() => {
          message.textContent = "Đã tạo thành công";
          message.classList.remove("text-red-500");
          message.classList.add("text-green-500");
          fetchTripsByStatus(); // refresh dữ liệu
        })
        .catch(err => {
          message.textContent = err.message;
          message.classList.remove("text-green-500");
          message.classList.add("text-red-500");
        });
      
  }
  

  function renderTrips() {
    const table = document.getElementById("tripTable");
    const search = document.getElementById("searchInput").value.toLowerCase();
    table.innerHTML = "";
  
    tripData.filter(t =>
      t.tuyen.toString().includes(search) ||
      t.trangthai.toLowerCase().includes(search)
    ).forEach((trip, index) => {
      table.innerHTML += `
        <tr class="border-t">
          <td class="py-2 px-4">${index + 1}</td> <!-- STT -->
          <td class="py-2 px-4">${trip.tuyen}</td>
          <td class="py-2 px-4">${trip.tau}</td>
          <td class="py-2 px-4">${trip.gio}</td>
          <td class="py-2 px-4">${trip.trangthai}</td>
          <td class="py-2 px-4">${trip.tu}</td>
          <td class="py-2 px-4">${trip.den}</td>
        </tr>`;
    });
  }
  

fetchTripsByStatus();
window.generateTrips = generateTrips;
