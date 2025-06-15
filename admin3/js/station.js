$(document).ready(function () {
    const table = $('#stationTable').DataTable();

    // Load danh sách trạm khi khởi động
    loadStations();

    // Thêm trạm
    $('#addForm').submit(function (e) {
        e.preventDefault();
        const data = {
            name: $('#name').val(),
            address: $('#address').val()
        };

        fetch('http://127.0.0.1:8080/api/stations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi khi thêm trạm");
                return res.json();
            })
            .then(() => {
                $('#addModal').modal('hide');
                $('#addForm')[0].reset();
                loadStations();
            })
            .catch(err => {
                console.error(err);
                alert("Không thể thêm trạm mới");
            });
    });

    // Sửa trạm
    $('#stationTable tbody').on('click', '.btn-edit', function () {
        $('#editId').val($(this).data('id'));
        $('#editName').val($(this).data('name'));
        $('#editAddress').val($(this).data('address'));
        $('#editModal').modal('show');
    });

    $('#editForm').submit(function (e) {
        e.preventDefault();
        const id = $('#editId').val();
        const data = {
            name: $('#editName').val(),
            address: $('#editAddress').val()
        };

        fetch(`http://127.0.0.1:8080/api/stations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi khi cập nhật");
                return res.json();
            })
            .then(() => {
                $('#editModal').modal('hide');
                loadStations();
            })
            .catch(err => {
                console.error(err);
                alert("Không thể cập nhật trạm");
            });
    });

    // Ngừng hoạt động trạm (thay vì xóa)
    $('#stationTable tbody').on('click', '.btn-delete', function () {
        const id = $(this).data('id');
        if (!confirm("Bạn có chắc muốn ngừng hoạt động trạm này?")) return;

        fetch(`http://127.0.0.1:8080/api/stations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.text())
            .then(msg => {
                alert(msg);
                loadStations();
            })
            .catch(err => {
                console.error(err);
                alert("Không thể ngừng hoạt động trạm");
            });
    });

    function loadStations() {
        table.clear().draw();

        fetch('http://127.0.0.1:8080/api/stations', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                data.forEach((station, index) => {
                    const status = station.status1 === "Đang hoạt động"
                        ? `<span class="badge badge-success">${station.status1}</span>`
                        : `<span class="badge badge-secondary">${station.status1}</span>`;

                    const actions = station.status1 === "Đang hoạt động" ? `
  <button class="btn btn-sm btn-primary btn-edit"
    data-id="${station.id}"
    data-name="${station.name}"
    data-address="${station.address}">
    Sửa
  </button>
  <button class="btn btn-sm btn-danger btn-delete" data-id="${station.id}">
    Xóa
  </button>
` : '';


                    table.row.add([
                        index + 1,
                        station.name,
                        station.address,
                        status,
                        actions
                    ]);
                });
                table.draw(false);
            })
            .catch(err => {
                console.error("Lỗi khi load danh sách trạm", err);
                alert("Không thể tải danh sách trạm");
            });
    }
});
