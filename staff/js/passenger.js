import CONFIG from '/common/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api`;
const token = localStorage.getItem('token');

document.addEventListener("DOMContentLoaded", function() {
    fetchTickets();
    initTicketFilters();
});

async function fetchTickets() {
    try {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const tickets = await response.json();
        loadTickets(tickets);
    } catch (error) {
        console.error("Lỗi khi fetch vé:", error);
    }
}

async function fetchStaffName(idStaff) {
    if (!idStaff) return '';
    try {
        const response = await fetch(`${API_BASE_URL}/staffs/${idStaff}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const staff = await response.json();
        return staff.fullName ?? '';
    } catch (error) {
        console.error(`Lỗi khi fetch nhân viên ID ${idStaff}:`, error);
        return '';
    }
}

async function fetchStationName(idStation) {
    if (!idStation) return '';
    try {
        const response = await fetch(`${API_BASE_URL}/stations/${idStation}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const station = await response.json();
        return station.name ?? '';
    } catch (error) {
        console.error(`Lỗi khi fetch bến ID ${idStation}:`, error);
        return '';
    }
}

async function loadTickets(tickets) {
    const tbody = document.querySelector("#ticket-list");
    tbody.innerHTML = "";

    for (const ticket of tickets) {
        const tr = document.createElement("tr");

        // Fetch tên nhân viên, nơi đi, nơi đến
        const [staffName, startStationName, endStationName] = await Promise.all([
            fetchStaffName(ticket.idStaff),
            fetchStationName(ticket.startStationId),
            fetchStationName(ticket.endStationId)
        ]);
        
        tr.innerHTML = `
            <td>${ticket.idTicket ?? ''}</td>
            <td>${ticket.customerName ?? ''}</td>
            <td>${startStationName}</td>
            <td>${endStationName}</td>
            <td>${ticket.startDepartureTime} ${formatDateOnly(ticket.departureDate)}</td>
            <td>${ticket.price !== undefined && ticket.price !== null ? ticket.price.toLocaleString('vi-VN') + ' VND' : ''}</td>
            <td>${ticket.seatQuantity ?? ''}</td>
            <td>${ticket.paymentMethod ?? ''}</td>
            <td>${ticket.bookingTime ? formatTime(ticket.bookingTime) : ''}</td>
            <td>${ticket.staffName ?? ''}</td>
            <td><button class="icon-button" id="viewDetailsBtn-${ticket.idTicket}">
                <i class="fa-solid fa-circle-info"></i>
                </button>
            </td>
        `;

        const viewDetailsBtn = tr.querySelector(`#viewDetailsBtn-${ticket.idTicket}`);
        viewDetailsBtn.addEventListener('click', () => viewDetails(ticket.idTicket));

        tbody.appendChild(tr);
    }
}

function formatTime(datetimeString) {
    const date = new Date(datetimeString);
    return date.toLocaleString('vi-VN'); 
}

function formatDateOnly(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');  // Trả về: 4/1/2025
}


// Popup và nội dung của nó
const popup = document.createElement('div');
popup.id = 'popup';
popup.classList.add('popup');
popup.innerHTML = `
    <div class="popup-content">
        <span class="close-btn" id="close-popup-btn"><i class="fa-solid fa-xmark"></i></span>
        <h2>Thông Tin Hành Khách</h2>
        <div id="passenger-info"></div>
    </div>
`;

document.body.appendChild(popup);
const closePopupBtn = document.querySelector('#close-popup-btn');
closePopupBtn.addEventListener('click', closePopup);

async function viewDetails(idTicket) {
    try {
        // Gọi API để lấy chi tiết vé
        const response = await fetch(`${API_BASE_URL}/tickets/details/${idTicket}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const passengers = await response.json();
        showPopup(passengers);
    } catch (error) {
        console.error("Lỗi khi fetch chi tiết vé:", error);
    }
}

function showPopup(passengers) {
    const passengerInfoDiv = document.getElementById("passenger-info");

    // Làm trống thông tin hành khách trước khi cập nhật
    passengerInfoDiv.innerHTML = "";

    passengers.forEach(passenger => {
        const passengerDiv = document.createElement("div");
        passengerDiv.innerHTML = `
            <p><strong>Họ tên:</strong> ${passenger.fullName}</p>
            <p><strong>Năm sinh:</strong> ${passenger.birthYear}</p>
            <p><strong>Ghế:</strong> ${passenger.seatNumbers.join(", ")}</p>
            <hr>
        `;
        passengerInfoDiv.appendChild(passengerDiv);
    });

    popup.style.display = "block";
}

function closePopup() {
    popup.style.display = "none";
}

async function initTicketFilters() {
  const searchInput = document.getElementById("search-general");
  const filterStart = document.getElementById("filter-start");
  const filterEnd = document.getElementById("filter-end");
  const filterDate = document.getElementById("filter-date");
  const ticketList = document.getElementById("ticket-list");

  try {
        const response = await fetch(`${API_BASE_URL}/stations`); 
        const stations = await response.json();

        // Xóa hết option cũ (chừa lại dòng đầu)
        filterStart.length = 1;
        filterEnd.length = 1;

        stations.forEach(station => {
            if (station.name) { // Chỉ thêm nếu có tên
                const option1 = document.createElement('option');
                option1.value = station.name;
                option1.textContent = station.name;
                filterStart.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = station.name;
                option2.textContent = station.name;
                filterEnd.appendChild(option2);
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách bến:', error);
    }

  if (!searchInput || !filterStart || !filterEnd || !filterDate || !ticketList) return;

  const filterTable = () => {
    const rows = ticketList.querySelectorAll("tr");
    const keyword = searchInput.value.toLowerCase();
    const startVal = filterStart.value.toLowerCase();
    const endVal = filterEnd.value.toLowerCase();
    const dateFil = filterDate.value;
    const dateVal = dateFil ? formatDateOnly(dateFil) : null;
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      const code = cells[0]?.textContent.toLowerCase();
      const name = cells[1]?.textContent.toLowerCase();
      const start = cells[2]?.textContent.toLowerCase();
      const end = cells[3]?.textContent.toLowerCase();
      const date = cells[4]?.textContent.split(" ")[1];

      const match = (!keyword || name.includes(keyword) || code.includes(keyword)) &&
                    (!startVal || start === startVal) &&
                    (!endVal || end === endVal) &&
                    (!dateVal || date === dateVal);

      row.style.display = match ? "" : "none";
    });
  };

  [searchInput, filterStart, filterEnd, filterDate].forEach(el => {
    el.addEventListener("input", filterTable);
    el.addEventListener("change", filterTable);
  });

  const clearBtn = document.getElementById("clear-filters");

    if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        filterStart.value = "";
        filterEnd.value = "";
        filterDate.value = "";
        filterTable(); // Hiển thị lại toàn bộ
    });
    }
} 
