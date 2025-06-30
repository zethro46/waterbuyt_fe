document.addEventListener("DOMContentLoaded", loadCategories);

function loadCategories() {
  fetch("http://127.0.0.1:8080/api/categories/categories-with-prices")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#categoryTable tbody");
      tbody.innerHTML = "";
      data.forEach(c => {
        tbody.innerHTML += `
          <tr>
            <td>${c.idCategory}</td>
            <td>${c.description}</td>
            <td>${c.status}</td>
            <td>${c.price?.toLocaleString("vi-VN") || "0"} đ</td>
            <td>${c.createdDate || "-"}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editCategory(${c.idCategory}, '${c.description}', '${c.status}', ${c.price || 0})">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.idCategory})">
                <i class="fas fa-trash"></i> Xoá
              </button>
            </td>
          </tr>`;
      });
    });
}

function showAddForm() {
  document.getElementById("categoryId").value = "";
  document.getElementById("description").value = "";
  document.getElementById("status").value = "";
  document.getElementById("price").value = "";
  $('#categoryModal').modal('show');
}

function closeModal() {
  $('#categoryModal').modal('hide');
}

document.getElementById("categoryForm").onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("categoryId").value;
  const body = {
    description: document.getElementById("description").value,
    status: document.getElementById("status").value,
    price: parseFloat(document.getElementById("price").value)
  };

  // THÊM MỚI
  if (!id) {
    fetch("http://127.0.0.1:8080/api/categories/categories-with-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(() => {
      closeModal();
      loadCategories();
    });
  } else {
    // CẬP NHẬT
    fetch(`http://127.0.0.1:8080/api/categories/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: body.description,
        status: body.status
      })
    }).then(() => {
      // Thêm giá mới (không sửa giá cũ)
      fetch("http://127.0.0.1:8080/api/categories/ticket-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: id,
          price: body.price
        })
      }).then(() => {
        closeModal();
        loadCategories();
      });
    });
  }
};

function editCategory(id, desc, status, price) {
  document.getElementById("categoryId").value = id;
  document.getElementById("description").value = desc;
  document.getElementById("status").value = status;
  document.getElementById("price").value = price || "";
  $('#categoryModal').modal('show');
}

function deleteCategory(id) {
  if (confirm("Bạn có chắc chắn muốn xoá?")) {
    fetch(`http://127.0.0.1:8080/api/categories/categories/${id}`, {
      method: "DELETE"
    }).then(() => loadCategories());
  }
}
