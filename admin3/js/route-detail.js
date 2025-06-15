import CONFIG from '/common/js/setting.js';

document.addEventListener("DOMContentLoaded", function () {
  const table = $('#routeDetailTable').DataTable({
    scrollY: '400px',
    scrollX: true,
    scrollCollapse: true,
    paging: true,
    lengthChange: true,
    pageLength: 10,
    ordering: false,
    searching: false,
    info: true,
    language: {
      lengthMenu: "Hiển thị _MENU_ dòng mỗi trang",
      info: "Trang _PAGE_ / _PAGES_",
      paginate: {
        previous: "Trước",
        next: "Sau"
      }
    }
  });

  fetch(`${CONFIG.BASE_URL}/api/routes/all`)
    .then(res => res.json())
    .then(data => {
      table.clear();
      data.forEach(d => {
        const routeText = d.route === 1 ? "Linh Đông → Bạch Đằng" : "Bạch Đằng → Linh Đông";
        table.row.add([
          d.idDetail || "",
          routeText,
          d.stationName || "",
          d.departureTime || ""
        ]);
      });
      table.draw();
    });
});
