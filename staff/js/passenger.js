import CONFIG from '/common/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api`;
const token = localStorage.getItem('token');

document.addEventListener("DOMContentLoaded", function() {
    fetchTickets();
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
            <td>${ticket.startDepartureTime} ${ticket.departureDate}</td>
            <td>${ticket.price !== undefined && ticket.price !== null ? ticket.price.toLocaleString('vi-VN') + ' VND' : ''}</td>
            <td>${ticket.seatQuantity ?? ''}</td>
            <td>${ticket.paymentMethod ?? ''}</td>
            <td>${ticket.bookingTime ? formatBookingTime(ticket.bookingTime) : ''}</td>
            <td>${staffName}</td>
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

function formatBookingTime(datetimeString) {
    const date = new Date(datetimeString);
    return date.toLocaleString('vi-VN'); 
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
            <p><strong>Ghế:</strong> ${passenger.seatIds.join(", ")}</p>
            <hr>
        `;
        passengerInfoDiv.appendChild(passengerDiv);
    });

    popup.style.display = "block";
}

function closePopup() {
    popup.style.display = "none";
}
