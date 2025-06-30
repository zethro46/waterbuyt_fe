// ======================
// Định dạng tiền tệ VNĐ
// ======================
function formatCurrency(value) {
  return (value || 0).toLocaleString("vi-VN") + " đ";
}

// ======================
// Gọi API doanh thu
// ======================
function fetchIncome(url, elementId) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Không có token. Hủy fetch:", url);
    document.getElementById(elementId).innerText = "0 đ";
    return;
  }

  fetch(url, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.text())
    .then(text => {
      const value = parseFloat(text);
      document.getElementById(elementId).innerText = formatCurrency(value);
    })
    .catch(err => {
      console.error("Lỗi khi tải doanh thu:", err);
      document.getElementById(elementId).innerText = "0 đ";
    });
}

// ======================
// Gọi API doanh thu theo tháng được chọn
// ======================
function loadIncomeStatsForMonth(yyyy, mm) {
  fetchIncome("http://127.0.0.1:8080/api/tickets/total", "totalIncome");

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  fetchIncome(`http://127.0.0.1:8080/api/tickets/day?date=${todayStr}`, "todayIncome");

  fetchIncome(`http://127.0.0.1:8080/api/tickets/month?year=${yyyy}&month=${mm}`, "monthIncome");
}

// ======================
// Tải biểu đồ vé bán theo tháng được chọn
// ======================
let ticketChartInstance = null; // dùng để destroy biểu đồ cũ

function loadTicketChart(selectedMonth) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Không có token. Hủy fetch biểu đồ.");
    return;
  }

  const ctx = document.getElementById("ticketChart").getContext("2d");
  const [yyyy, mm] = selectedMonth.split("-");
  const year = parseInt(yyyy);
  const month = parseInt(mm);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const currentDay = isCurrentMonth
    ? today.getDate()
    : new Date(year, month, 0).getDate(); // số ngày của tháng

  const monthName = new Date(year, month - 1).toLocaleString("vi-VN", { month: "long" });
  const titleElement = document.querySelector(".card-title");
  if (titleElement) {
    titleElement.innerText = `Thống kê vé bán tháng ${monthName}`;
  }

  fetch(`http://127.0.0.1:8080/api/tickets/stats/month?year=${year}&month=${month}`, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      const labels = [], values = [], bgColors = [], borderColors = [];

      for (let i = 1; i <= currentDay; i++) {
        labels.push(i); // chỉ số ngày
        const found = data.find(d => d.day === i);
        const count = found ? found.ticketCount : 0;
        values.push(count);

        bgColors.push("rgba(54, 162, 235, 0.6)");
        borderColors.push("rgba(54, 162, 235, 1)");
      }

      // ✅ Ẩn biểu đồ nếu không có dữ liệu
      const canvas = document.getElementById("ticketChart");
      if (values.every(v => v === 0)) {
        canvas.style.display = "none";
        return;
      } else {
        canvas.style.display = "block";
      }

      // ✅ Xoá biểu đồ cũ trước khi tạo mới
      if (ticketChartInstance) {
        ticketChartInstance.destroy();
      }

      ticketChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Số vé bán",
            data: values,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 1,
            barThickness: 24,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: context => `Ngày ${context.label}: ${context.formattedValue} vé`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              min: 0, // ✅ luôn bắt đầu từ 0
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error("Lỗi khi tải dữ liệu biểu đồ:", err);
      document.getElementById("ticketChart").style.display = "none";
    });
}



// ======================
// Khi trang load xong
// ======================
document.addEventListener("DOMContentLoaded", function () {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // yyyy-MM
  const [yyyy, mm] = currentMonth.split("-");

  const monthInput = document.getElementById("monthPicker");
  if (monthInput) {
    monthInput.value = currentMonth;

    monthInput.addEventListener("change", function () {
      const selectedMonth = this.value;
      const [y, m] = selectedMonth.split("-");
      loadTicketChart(selectedMonth);
      loadIncomeStatsForMonth(y, m);
    });
  }

  loadTicketChart(currentMonth);
  loadIncomeStatsForMonth(yyyy, mm);
});
