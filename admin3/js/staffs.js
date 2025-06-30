// GLOBAL: Xoá nhân viên
function deleteStaff(id) {
  if (!confirm("Bạn có chắc chắn muốn xoá nhân viên này không?")) return;

  fetch(`http://127.0.0.1:8080/api/staffs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(async response => {
      if (response.status === 204) {
        return "Xoá thành công";
      } else if (response.ok) {
        return await response.text();
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Không thể xoá");
      }
    })
    .then(msg => {
      alert(msg);
      loadStaffs();
    })
    .catch(error => {
      console.error("Lỗi khi xoá:", error);
      alert(error.message || "Không thể xoá nhân viên!");
    });
}

function loadStaffs() {
  const table = $('#staffTable').DataTable();
  fetch("http://127.0.0.1:8080/api/staffs", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
    .then(response => response.json())
    .then(data => {
      table.clear().draw();
      data.forEach(staff => {
        const role = staff.role ? staff.role.toUpperCase() : "CHƯA CÓ";
        let color = "secondary";
        if (role === "ADMIN") color = "danger";
        else if (role === "STAFF") color = "primary";

        let actionButtons = "";
        const isAdmin = role === "ADMIN";

        if (role === "CHƯA CÓ") {
          actionButtons = `
    <button class="btn btn-sm btn-success btn-create-account"
            data-id="${staff.id}"
            data-name="${staff.fullName}">Tạo tài khoản</button>
    <button class="btn btn-sm btn-danger"
            onclick="deleteStaff(${staff.id})">Xoá</button>
  `;
        } else {
          actionButtons = `
    <button class="btn btn-sm btn-warning btn-edit"
            ${isAdmin ? "disabled style='opacity:0.6; cursor:not-allowed;' title='Không thể sửa ADMIN'" : ""}
            data-staff='${JSON.stringify(staff).replace(/'/g, "&#39;")}'>Sửa</button>
    <button class="btn btn-sm btn-danger"
            ${isAdmin ? "disabled style='opacity:0.6; cursor:not-allowed;' title='Không thể xoá ADMIN'" : `onclick='deleteStaff(${staff.id})'`}>Xoá</button>
  `;
        }


        table.row.add([
          staff.fullName,
          staff.identityNumber,
          staff.birthDate,
          staff.gender,
          staff.phone,
          staff.email,
          staff.address,
          `<span class="badge badge-${color}">${role}</span>`,
          actionButtons
        ]).draw(false);
      });
    })
    .catch(err => {
      console.error("Lỗi khi load danh sách nhân viên:", err);
      alert("Không thể tải danh sách nhân viên");
    });
}

$(document).ready(function () {
  const table = $('#staffTable').DataTable();
  loadStaffs();

  $('#staffTable tbody').on('click', '.btn-edit', function () {
    const staff = JSON.parse($(this).attr('data-staff'));
    $('#staffId').val(staff.id);
    $('#fullName').val(staff.fullName);
    $('#identityNumber').val(staff.identityNumber);
    $('#birthDate').val(staff.birthDate);
    $('#gender').val(staff.gender);
    $('#phone').val(staff.phone);
    $('#email').val(staff.email);
    $('#address').val(staff.address);
    $('#staffModal').modal('show');
  });

  $('#staffForm').submit(function (e) {
    e.preventDefault();
    const staffId = $('#staffId').val();
    const isUpdate = !!staffId;
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate ? `http://127.0.0.1:8080/api/staffs/${staffId}` : 'http://127.0.0.1:8080/api/staffs';

    const staff = {
      fullName: $('#fullName').val(),
      identityNumber: $('#identityNumber').val(),
      birthDate: $('#birthDate').val(),
      gender: $('#gender').val(),
      phone: $('#phone').val(),
      email: $('#email').val(),
      address: $('#address').val()
    };

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(staff)
    })
      .then(response => {
        if (!response.ok) throw new Error('Không thể thêm/cập nhật');
        return response.text();
      })
      .then(msg => {
        alert(isUpdate ? "Cập nhật thành công" : "Thêm thành công");
        $('#staffModal').modal('hide');
        $('#staffForm')[0].reset();
        $('#staffId').val('');
        loadStaffs();
      })
      .catch(error => {
        console.error('Lỗi khi thêm/cập nhật:', error);
        alert(error.message || 'Thêm hoặc cập nhật nhân viên thất bại!');
      });
  });

  // Mở modal tạo tài khoản
  $('#staffTable tbody').on('click', '.btn-create-account', function () {
    const staffId = $(this).data('id');
    const name = $(this).data('name');
    $('#accountStaffId').val(staffId);
    $('#accountStaffName').text(name);
    $('#createAccountModal').modal('show');
  });

  $('#createAccountForm').submit(function (e) {
    e.preventDefault();
    const staffId = $('#accountStaffId').val();
    const username = $('#accountUsername').val();
    const password = $('#accountPassword').val();
    const confirm = $('#accountPasswordConfirm').val();

    if (password !== confirm) {
      alert("Mật khẩu không khớp");
      return;
    }

    fetch("http://127.0.0.1:8080/api/staffs/create_acount", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ username, password, staffId })
    })
      .then(async res => {
        const message = await res.text();
        if (!res.ok) throw new Error(message || "Tạo tài khoản thất bại");
        return message;
      })

      .then(msg => {
        alert("Tạo tài khoản thành công");
        $('#createAccountForm')[0].reset();
        $('#createAccountModal').modal('hide');
        loadStaffs();
      })
      .catch(err => {
        console.error("Lỗi tạo tài khoản:", err);
        alert(err.message);
      });
  });
});

// Xem & cập nhật thông tin cá nhân
document.getElementById("profileIcon").addEventListener("click", () => {
  fetch("http://127.0.0.1:8080/api/staffs/1", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("profileId").value = data.id;
      document.getElementById("profileFullName").value = data.fullName;
      document.getElementById("profileIdentity").value = data.identityNumber;
      document.getElementById("profileBirthDate").value = data.birthDate;
      document.getElementById("profileGender").value = data.gender;
      document.getElementById("profilePhone").value = data.phone;
      document.getElementById("profileEmail").value = data.email;
      document.getElementById("profileAddress").value = data.address;

      toggleProfileForm(false);
      $('#profileModal').modal('show');
    });
});

function toggleProfileForm(editable) {
  const fields = [
    "profileFullName", "profileIdentity", "profileBirthDate",
    "profileGender", "profilePhone", "profileEmail", "profileAddress"
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el.tagName === "SELECT") el.disabled = !editable;
    else el.readOnly = !editable;
  });
  document.getElementById("saveBtn").disabled = !editable;
}

document.getElementById("editBtn").addEventListener("click", () => {
  toggleProfileForm(true);
});

document.getElementById("profileForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("profileId").value;
  const updatedData = {
    fullName: document.getElementById("profileFullName").value,
    identityNumber: document.getElementById("profileIdentity").value,
    birthDate: document.getElementById("profileBirthDate").value,
    gender: document.getElementById("profileGender").value,
    phone: document.getElementById("profilePhone").value,
    email: document.getElementById("profileEmail").value,
    address: document.getElementById("profileAddress").value
  };

  fetch(`http://127.0.0.1:8080/api/staffs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(updatedData)
  })
    .then(res => {
      if (!res.ok) throw new Error("Cập nhật thất bại");
      return res.text();
    })
    .then(msg => {
      alert("Cập nhật thành công!");
      $('#profileModal').modal('hide');
    })
    .catch(err => {
      console.error("Lỗi cập nhật:", err);
      alert(err.message);
    });
});
