let routeData = [];

function renderRouteList() {
  const table = document.getElementById("routeTable");
  table.innerHTML = "";
  routeData.forEach((route, index) => {
    table.innerHTML += `
      <tr class="border-t">
        <td class="py-2 px-4">${route.diemDi}</td>
        <td class="py-2 px-4">${route.diemDen}</td>
        <td class="py-2 px-4">
          <button onclick="editRoute(${index})" class="text-blue-500 mr-2">Sửa</button>
          <button onclick="deleteRoute(${index})" class="text-red-500">Xóa</button>
        </td>
      </tr>`;
  });
}

function submitRoute(e) {
  e.preventDefault();
  const diemDi = document.getElementById("diemDi").value;
  const diemDen = document.getElementById("diemDen").value;
  const editingIndex = document.getElementById("editingIndex").value;

  const route = { diemDi, diemDen };

  if (editingIndex !== "") {
    routeData[editingIndex] = route;
  } else {
    routeData.push(route);
  }

  document.getElementById("routeForm").reset();
  document.getElementById("editingIndex").value = "";
  renderRouteList();
}

function editRoute(index) {
  const route = routeData[index];
  document.getElementById("diemDi").value = route.diemDi;
  document.getElementById("diemDen").value = route.diemDen;
  document.getElementById("editingIndex").value = index;
}

function deleteRoute(index) {
  if (confirm("Bạn có chắc muốn xóa tuyến này?")) {
    routeData.splice(index, 1);
    renderRouteList();
  }
}

renderRouteList();