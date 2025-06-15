let stationMap = {};

function loadStations() {
  return fetch('http://127.0.0.1:8080/api/stations', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      const startSelect = $('#startStationSelect');
      const endSelect = $('#endStationSelect');
      startSelect.empty();
      endSelect.empty();
      stationMap = {};

      data.forEach(station => {
        stationMap[station.id] = station.name;

        const option = `<option value="${station.id}">${station.name}</option>`;
        startSelect.append(option);
        endSelect.append(option);
      });
    })
    .catch(err => {
      console.error("Lỗi khi load danh sách bến:", err);
      alert("Không thể load danh sách bến!");
    });
}

function loadRoutes() {
  const table = $('#routeTable').DataTable();
  table.clear().draw();

  fetch('http://127.0.0.1:8080/api/routes', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      data.forEach(route => {
        const row = table.row.add([
          route.id,
          stationMap[route.startStationId] || `#${route.startStationId}`,
          stationMap[route.endStationId] || `#${route.endStationId}`
        ]).draw(false).node();
      });
    })
    .catch(err => {
      console.error("Lỗi khi load tuyến:", err);
      alert("Không thể load danh sách tuyến!");
    });
}

$(document).ready(function () {
  $('#routeTable').DataTable();

  // Load stations before loading routes
  loadStations().then(loadRoutes);

  $('#createRouteForm').submit(function (e) {
    e.preventDefault();
    const body = {
      startStationId: $('#startStationSelect').val(),
      endStationId: $('#endStationSelect').val()
    };

    fetch('http://127.0.0.1:8080/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
        return res.json();
      })
      .then(() => {
        $('#createRouteModal').modal('hide');
        loadRoutes();
      })
      .catch(err => {
        console.error("Tạo tuyến thất bại", err);
        alert(err.message || "Không thể tạo tuyến");
      });
  });
});
