const chartCtx = document.getElementById('monthlyRevenueChart').getContext('2d');
const monthlyRevenueData = {
  labels: [],
  data: []
};

const monthlyChart = new Chart(chartCtx, {
  type: 'bar',
  data: {
    labels: monthlyRevenueData.labels,
    datasets: [{
      label: 'Doanh thu theo tháng (VNĐ)',
      data: monthlyRevenueData.data,
      backgroundColor: 'rgba(75, 192, 192, 0.7)'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

window.fetchDailyRevenue = async function () {
  const selectedDate = document.getElementById("revenueDateInput").value;
  if (!selectedDate) return;

  try {
    const res = await fetch(`http://localhost:8080/api/tickets/day?date=${selectedDate}`);
    const data = await res.json();

    document.getElementById("selectedDate").innerText = data.label;
    document.getElementById("dailyRevenue").innerText = data.totalRevenue.toLocaleString('vi-VN') + 'đ';
  } catch (err) {
    console.error("Lỗi khi gọi API ngày:", err);
  }
};

window.fetchMonthlyRevenue = async function () {
  const input = document.getElementById("revenueMonthInput").value;
  if (!input) return;

  const [year, month] = input.split("-");
  try {
    const res = await fetch(`http://localhost:8080/api/tickets/month?month=${parseInt(month)}&year=${year}`);
    const data = await res.json();

    document.getElementById("selectedMonth").innerText = data.label;
    document.getElementById("monthlyRevenue").innerText = data.totalRevenue.toLocaleString('vi-VN') + 'đ';

    if (!monthlyRevenueData.labels.includes(data.label)) {
      monthlyRevenueData.labels.push(data.label);
      monthlyRevenueData.data.push(data.totalRevenue);
      monthlyChart.update();
    }
  } catch (err) {
    console.error("Lỗi khi gọi API tháng:", err);
  }
};

// Load mặc định 6 tháng gần nhất khi mở trang
(async function loadInitialMonthlyData() {
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    try {
      const res = await fetch(`http://localhost:8080/api/tickets/month?month=${month}&year=${year}`);
      const data = await res.json();
      monthlyRevenueData.labels.push(data.label);
      monthlyRevenueData.data.push(data.totalRevenue);
    } catch (err) {
      console.error(`Lỗi khi tải dữ liệu tháng ${month}/${year}:`, err);
    }
  }
  monthlyChart.update();
})();
