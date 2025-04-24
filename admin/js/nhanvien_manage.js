let nvData = [
    { hoten: "Nguyễn Văn A", cccd: "123456789", sdt: "0123456789", email: "a@gmail.com", role: "ADMIN", username: "admin_a" }
  ];
  function renderNhanVien() {
    const table = document.getElementById("nvTable");
    const search = document.getElementById("searchInput").value.toLowerCase();
    table.innerHTML = "";
    nvData.filter(nv =>
      nv.hoten.toLowerCase().includes(search) ||
      nv.email.toLowerCase().includes(search)
    ).forEach((nv, index) => {
      table.innerHTML += `
        <tr class="border-t">
          <td class="py-2 px-4">${nv.hoten}</td>
          <td class="py-2 px-4">${nv.cccd}</td>
          <td class="py-2 px-4">${nv.sdt}</td>
          <td class="py-2 px-4">${nv.email}</td>
          <td class="py-2 px-4">${nv.role}</td>
          <td class="py-2 px-4">${nv.username}</td>
          <td class="py-2 px-4">
            <button onclick="editNhanVien(${index})" class="text-blue-500 mr-2">Sửa</button>
            <button onclick="deleteNhanVien(${index})" class="text-red-500">Xóa</button>
          </td>
        </tr>`;
    });
  }
  function submitNhanVien(e) {
    e.preventDefault();
    const nv = {
      hoten: document.getElementById("hoten").value,
      cccd: document.getElementById("cccd").value,
      sdt: document.getElementById("sdt").value,
      email: document.getElementById("email").value,
      role: document.getElementById("role").value,
      username: document.getElementById("username").value,
    };
    const index = document.getElementById("editingIndex").value;
    if (index !== "") {
      nvData[index] = nv;
    } else {
      nvData.push(nv);
    }
    document.getElementById("nvForm").reset();
    document.getElementById("editingIndex").value = "";
    renderNhanVien();
  }
  function editNhanVien(index) {
    const nv = nvData[index];
    document.getElementById("hoten").value = nv.hoten;
    document.getElementById("cccd").value = nv.cccd;
    document.getElementById("sdt").value = nv.sdt;
    document.getElementById("email").value = nv.email;
    document.getElementById("role").value = nv.role;
    document.getElementById("username").value = nv.username;
    document.getElementById("editingIndex").value = index;
  }
  function deleteNhanVien(index) {
    if (confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      nvData.splice(index, 1);
      renderNhanVien();
    }
  }
  renderNhanVien();