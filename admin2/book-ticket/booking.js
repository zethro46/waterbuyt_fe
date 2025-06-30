import CONFIG from '/common/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api`;

const MAX_SEATS = 6;

let PRICE_PER_SEAT;
let idDefault = 2;

fetch(`${API_BASE_URL}/tickets/latest?categoryId=3`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
  .then(res => res.json())
  .then(data => {
    PRICE_PER_SEAT = data;
    console.log('Giá ghế lấy từ API:', PRICE_PER_SEAT);

    // Bạn có thể tiếp tục xử lý ở đây
    // ví dụ: sử dụng PRICE_PER_SEAT trong các phép tính
    })
  .catch(error => {
    console.error('Lỗi khi fetch dữ liệu:', error);
  });

async function fetchStations() {
    try {
        const response = await fetch(`${API_BASE_URL}/stations`); 
        const stations = await response.json();

        // Lấy thẻ select
        const departureSelect = document.getElementById('route-departure');
        const destinationSelect = document.getElementById('route-destination');

        // Xóa hết option cũ (chừa lại dòng đầu)
        departureSelect.length = 1;
        destinationSelect.length = 1;

        stations.forEach(station => {
            if (station.name) { // Chỉ thêm nếu có tên
                const option1 = document.createElement('option');
                option1.value = station.id;
                option1.textContent = station.name;
                departureSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = station.id;
                option2.textContent = station.name;
                destinationSelect.appendChild(option2);
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách bến:', error);
    }
}


// Trong service_book_ticket.js


// Đã có fetchStations() như bạn rồi

document.getElementById('search-trip').addEventListener('click', async function () {
    // Xóa bookingData cũ nếu có
    const oldBookingKey = Object.keys(localStorage).find((key) =>
        key.startsWith("bookingData_")
    );
    if (oldBookingKey) {
        localStorage.removeItem(oldBookingKey);
        console.log(`Đã xóa thông tin booking cũ: ${oldBookingKey}`);
    }
    const departureSelect = document.getElementById('route-departure');
    const destinationSelect = document.getElementById('route-destination');
    const dateInput = document.querySelector('#date-picker input');

    const startStationId = parseInt(departureSelect.value);
    const endStationId = parseInt(destinationSelect.value);
    const departureDate = dateInput.value;

    // Kiểm tra hợp lệ
    if (!startStationId || !endStationId || !departureDate) {
        alert('Vui lòng chọn đầy đủ Nơi đi, Nơi đến và Ngày khởi hành.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/customers/search-trips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startStationId,
                endStationId,
                departureDate
            })
        });

        if (!response.ok) {
            throw new Error('Không thể tìm chuyến.');
        }

        const trips = await response.json();
        renderTrips(trips);

    } catch (error) {
        console.error('Lỗi khi tìm chuyến:', error);
        alert('Đã xảy ra lỗi khi tìm chuyến.');
    }
});

async function renderTrips(trips) {
    const resultTrips = document.getElementById('result-trips');
    resultTrips.innerHTML = ''; // Xóa kết quả cũ
    const departureSelect = document.getElementById('route-departure');
    const destinationSelect = document.getElementById('route-destination');
    const startStationId = parseInt(departureSelect.value);
    const endStationId = parseInt(destinationSelect.value);

    if (trips.length === 0) {
        resultTrips.innerHTML = '<p>Không tìm thấy chuyến nào.</p>';
    } else {
        for (const trip of trips) {

            const routeResponse = await fetch(`${API_BASE_URL}/routes/${trip.routeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const route = await routeResponse.json();

            // 1. Gọi API lấy danh sách ghế theo shipId
            const seatsResponse = await fetch(`${API_BASE_URL}/ships/seat/${trip.shipId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const seats = await seatsResponse.json();
            const totalSeatsCount = seats.length;

            // 2. Gọi API lấy danh sách ghế trống cho chuyến
            const emptySeatsResponse = await fetch(`${API_BASE_URL}/customers/available`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tripId: trip.tripId,
                    startStationId: startStationId,
                    endStationId: endStationId
                })
            });
            const emptySeats = await emptySeatsResponse.json();
            const availableSeatsCount = emptySeats.length;
            console.log(`${availableSeatsCount}`);
            // 3. Render thẻ HTML
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';
            tripCard.setAttribute('data-trip-id', trip.tripId);
            tripCard.innerHTML = `
                <div class="trip-info">
                    <article class="trip-details">
                        <img src="/staff/assets/images/waterbus.png" alt="Waterbus" class="trip-image">
                        <section class="trip-info">
                            <span class="trip-title">Ghế ngồi ${totalSeatsCount} chỗ</span>
                            <div class="trip-route">
                                <p class="station-info">
                                    <i class="fa-solid fa-circle text-green"></i>
                                    <time class="route-time">${trip.startTime}</time>
                                    <span class="route-station">${trip.startStation}</span>
                                </p>
                                <p class="station-info">
                                    <i class="fa-solid fa-location-dot text-blue"></i>
                                    <time class="route-time">${trip.endTime}</time>
                                    <span class="route-station">${trip.endStation}</span>
                                </p>
                            </div>
                        </section>
                        <aside class="trip-price">15.000 đ</aside>
                        <div class="seat-info">
                            <span>Còn ${availableSeatsCount} ghế trống</span>
                            <button class="choose-seat-btn" id="choose-seat-btn-${trip.tripId}">Chọn chỗ</button>


                        </div>
                    </article>
                    <p class="trip-note">
                        * Vé chặng thuộc chuyến ${trip.startTime} ${trip.departureDate} ${route.startStation} - ${route.endStation}
                    </p>
                </div>

                <div class="modal">
                        <div class="modal-content" id="modal-content-${trip.tripId}">
                            <span class="close" id="close-x"><i class="fa-solid fa-xmark"></i></span>
                            <h2>Chọn chỗ ngồi</h2>
                            <div class="legend">
                                <div><span class="seat available"></span> Còn trống</div>
                                <div><span class="seat selected"></span> Đang chọn</div>
                                <div><span class="seat unavailable"></span> Không bán</div>
                              </div>
                          
                              <div id="notification" class="notification hidden"></div>
                          
                              <div id="seat-map-${trip.tripId}" class="seat-map"></div>
                          
                              <div class="summary">
                                <div>
                                  <strong>Số ghế:</strong> <span id="seat-list-${trip.tripId}">Vui lòng chọn ít nhất 1 chỗ ngồi</span>
                                  <span class="note">(Tối đa 6 ghế)</span>
                                </div>
                                <div class="right">
                                  <span><strong>Tổng cộng:</strong> <span id="total-price-${trip.tripId}">0</span> đ</span>
                                  <button class="continue-btn" id="continue-btn-${trip.tripId}" disabled>Tiếp tục</button>
                                </div>
                              </div>
                        </div>
                      
                      <div class="passenger-infor" id="passenger-infor-${trip.tripId}">
                        <h2>Thông tin hành khách</h2>
                        <div id="passenger-list-${trip.tripId}"></div>

                        <h2>Thông tin người đặt vé</h2>
                        <div class="booker-info">
                          <div class="passenger-form-group">
                            <label>Họ tên người đặt vé</label>
                            <input type="text" id="booker-name-${trip.tripId}" required>
                          </div>
                          <div class="passenger-form-group">
                            <label>Số điện thoại</label>
                            <input type="text" id="booker-phone-${trip.tripId}" required>
                          </div>
                          <div class="passenger-form-group">
                            <label>Email</label>
                            <input type="email" id="booker-email-${trip.tripId}" required>
                          </div>
                          <div class="passenger-form-group">
                            <label>Năm sinh</label>
                            <input type="text" id="booker-dob-${trip.tripId}" required>
                          </div>
                          <div class="passenger-form-group">
                            <label>Giới tính</label>
                            <input type="text" id="booker-gender-${trip.tripId}" required>
                          </div>
                          <div class="passenger-form-group">
                            <label>Quốc tịch</label>
                            <input type="text" id="booker-nationality-${trip.tripId}" required>
                          </div>
                        </div>

                        <div class="btn-group">
                          <button id="back-to-seat-${trip.tripId}" class="back-btn">Quay lại chọn ghế</button>
                          <button id="submit-booking-${trip.tripId}" class="submit-booking-btn">Xác nhận đặt vé</button>
                        </div>
                      </div>

                    </div>
            `;

            
            resultTrips.appendChild(tripCard);
            const chooseSeatBtn = tripCard.querySelector('.choose-seat-btn');
                chooseSeatBtn.addEventListener('click', (event) => {
                openSeatModal(event.currentTarget);
            });
            renderSeats(trip.tripId, trip.shipId, startStationId, endStationId);

            const continueButton = document.getElementById(`continue-btn-${trip.tripId}`);
            const backSelecteSeatBtn = document.getElementById(`back-to-seat-${trip.tripId}`);
            const submitBookingBtn = document.getElementById(`submit-booking-${trip.tripId}`);

            backSelecteSeatBtn.addEventListener('click', function() {
                document.getElementById(`passenger-infor-${trip.tripId}`).style.display = 'none';
                document.getElementById(`modal-content-${trip.tripId}`).style.display = 'block';
              });

            

            
            
            
              continueButton.addEventListener('click', function() {
                const seatList = document.getElementById(`seat-list-${trip.tripId}`);
                const modalContent = document.getElementById(`modal-content-${trip.tripId}`);
                const passengerInfor = document.getElementById(`passenger-infor-${trip.tripId}`);
                const passengerList = document.getElementById(`passenger-list-${trip.tripId}`);
            
                const modal = modalContent.closest('.modal');
                const selectedSeats = JSON.parse(modal.dataset.selectedSeatsJson || "[]");
            
                const seatListText = seatList.innerText;
                const seats = seatListText.split(',').map(seat => seat.trim()).filter(seat => seat);
            
                if (seats.length === 0) {
                    alert('Vui lòng chọn ít nhất 1 ghế');
                    return;
                }
            
                modalContent.style.display = 'none';
                passengerInfor.style.display = 'block';
            
                passengerList.innerHTML = '';
            
                seats.forEach((seat, index) => {
                    const div = document.createElement('div');
                    div.classList.add('passenger-form-group');
                    div.innerHTML = `
                        <label>Hành khách ${index + 1}</label>
                        <input type="text" placeholder="Họ và tên" name="passenger-name-${index}" id="passenger-name-${index}" required>
                        <input type="number" placeholder="Năm sinh (VD: 1995)" name="passenger-dob-${index}" min="1900" max="2025" id="passenger-dob-${index}" required>
                    `;
                    passengerList.appendChild(div);
                });
            
                const inputs = [
                    document.getElementById(`booker-name-${trip.tripId}`),
                    document.getElementById(`booker-phone-${trip.tripId}`),
                    document.getElementById(`booker-email-${trip.tripId}`),
                    document.getElementById(`booker-gender-${trip.tripId}`),
                    document.getElementById(`booker-dob-${trip.tripId}`),
                    document.getElementById(`booker-nationality-${trip.tripId}`),
                    ...seats.map((_, index) => document.getElementById(`passenger-name-${index}`)),
                    ...seats.map((_, index) => document.getElementById(`passenger-dob-${index}`))
                ].filter(input => input);
            
                function checkInputs() {
                    const allFilled = inputs.every(input => input && input.value.trim() !== '');
                    submitBookingBtn.disabled = !allFilled;
                }
            
                inputs.forEach(input => {
                    input.addEventListener('input', checkInputs);
                });
            
                checkInputs();
            
                const listSeatSelectedInput = selectedSeats.map((seatId, index) => ({
                    seatId: seatId
                }));
            
                
                const listPassengerInput = [];
            
                seats.forEach((seat, index) => {
                    const passengerName = document.getElementById(`passenger-name-${index}`).value;
                    const passengerDob = document.getElementById(`passenger-dob-${index}`).value;
                    listPassengerInput.push({
                        name: passengerName,
                        dob: passengerDob
                    });
                });
            
                submitBookingBtn.addEventListener('click', function() {
                    const bookerNameInput = document.getElementById(`booker-name-${trip.tripId}`).value;
                    const bookerPhoneInput = document.getElementById(`booker-phone-${trip.tripId}`).value;
                    const bookerEmailInput = document.getElementById(`booker-email-${trip.tripId}`).value;
                    const bookerGenderInput = document.getElementById(`booker-gender-${trip.tripId}`).value;
                    const bookerDOB = document.getElementById(`booker-dob-${trip.tripId}`).value;
                    const bookerNationalityInput = document.getElementById(`booker-nationality-${trip.tripId}`).value;
                
                    const listPassengerInput = [];
                    const listSeatNumberInput = []
                    seats.forEach((seat, index) => {
                        const passengerName = document.getElementById(`passenger-name-${index}`).value;
                        const passengerDob = document.getElementById(`passenger-dob-${index}`).value;
                        listPassengerInput.push({
                            name: passengerName,
                            dob: passengerDob
                        });
                        listSeatNumberInput.push({
                            seats: seat,
                        });
                    });
                
                    const bookingData = {
                        fullname: bookerNameInput,
                        phone: bookerPhoneInput,
                        bookerDOB:bookerDOB,
                        email: bookerEmailInput,
                        nationality: bookerNationalityInput,
                        startStationId: parseInt(document.getElementById('route-departure').value),
                        endStationId: parseInt(document.getElementById('route-destination').value),
                        tripId: trip.tripId,
                        staffId: idDefault,
                        seatIds: listSeatSelectedInput,
                        seatNumbers:listSeatNumberInput,
                        details: listPassengerInput
                    };
                
                    const bookingId = `bookingData_${Date.now()}`;
                    localStorage.setItem(bookingId, JSON.stringify(bookingData));
                
                    console.log('Booking Data:', bookingData);
                    window.location.href = '/admin2/book-ticket/payment.html';
                });
            
                const chooseSeatBtn = document.querySelector(".choose-seat-btn");
                chooseSeatBtn.addEventListener('click', function() {
                    openSeatModal(this);
                });
            });

            
        }

        function openSeatModal(button) {
            const card = button.closest(".trip-card");
            const modal = card.querySelector(".modal");
          
            modal.classList.toggle("active");
          }
          
        
        
          function handleSeatClick(seatId, seatEl, modal, tripId) {
            let selectedSeats = JSON.parse(modal.dataset.selectedSeatsJson || "[]");
            const isSelected = selectedSeats.includes(seatId);
        
            // Nếu ghế đã được chọn thì bỏ chọn
            if (isSelected) {
                selectedSeats = selectedSeats.filter(id => id !== seatId);
                seatEl.classList.remove("selected");
            }
            // Nếu chưa chọn và chưa vượt quá giới hạn ghế, chọn ghế
            else if (selectedSeats.length < MAX_SEATS) {
                selectedSeats.push(seatId);
                seatEl.classList.add("selected");
            }
        
            // Cập nhật danh sách ghế đã chọn trong modal
            modal.dataset.selectedSeatsJson = JSON.stringify(selectedSeats);
        
            // Cập nhật trạng thái ghế và thông tin tóm tắt
            updateSeatStatus(modal);
            updateSeatSummary(modal, tripId);
        }
        
        
        function updateSeatStatus(modal) {
            const selectedSeats = JSON.parse(modal.dataset.selectedSeatsJson || "[]");
            const seatButtons = modal.querySelectorAll('.seat .available');
            const notificationEl = modal.querySelector(".notification");
        
            // Cập nhật trạng thái ghế đã chọn
            seatButtons.forEach(seatBtn => {
                const seatId = seatBtn.getAttribute('data-seatid');
                const isSelected = selectedSeats.includes(seatId);
        
                // Vô hiệu hóa ghế nếu đã chọn đủ số lượng
                if (!isSelected && selectedSeats.length >= MAX_SEATS) {
                    seatBtn.classList.add('disabled');
                    seatBtn.disabled = true;
                } else {
                    seatBtn.classList.remove('disabled');
                    seatBtn.disabled = false;
                }
            });
        
            // Hiển thị thông báo khi chọn đủ số ghế
            if (selectedSeats.length >= MAX_SEATS) {
                notificationEl.textContent = `Bạn đã chọn tối đa ${MAX_SEATS} ghế. Để chọn ghế khác, vui lòng bỏ chọn một ghế trước.`;
                notificationEl.classList.remove("hidden");
            } else {
                notificationEl.classList.add("hidden");
            }
        }
        
        
        
        
        function updateSeatSummary(modal, tripId) {
            const selectedSeats = JSON.parse(modal.dataset.selectedSeatsJson || "[]");
            const seatListEl = modal.querySelector(`#seat-list-${tripId}`);
            const totalPriceEl = modal.querySelector(`#total-price-${tripId}`);
            const continueBtn = modal.querySelector(`#continue-btn-${tripId}`);
        
            // Kiểm tra nếu chưa chọn ghế
            if (selectedSeats.length === 0) {
                seatListEl.textContent = "Vui lòng chọn ít nhất 1 chỗ ngồi";
                continueBtn.disabled = true;
                continueBtn.classList.remove("enabled");
            } else {
                // Tạo danh sách các ghế đã chọn
                const selectedSeatLabels = selectedSeats.map(seatId => {
                    const seatButton = modal.querySelector(`.seat[data-seatid="${seatId}"]`);
                    return seatButton ? seatButton.textContent : '';
                }).filter(label => label !== '').join(", ");
        
                seatListEl.textContent = "Ghế " + selectedSeatLabels;
                continueBtn.disabled = false;
                continueBtn.classList.add("enabled");
            }
        
            // Tính tổng giá trị ghế đã chọn
            totalPriceEl.textContent = formatPrice(selectedSeats.length * PRICE_PER_SEAT);
        }
        
        
        
        function formatPrice(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        
        
        async function renderSeats(tripId, shipId, startStationId, endStationId) {
            try {
                const seatMapEl = document.getElementById(`seat-map-${tripId}`);
                seatMapEl.innerHTML = "";
        
                const shipSeatsResponse = await fetch(`${API_BASE_URL}/ships/seat/${shipId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const allSeats = await shipSeatsResponse.json();
        
                const emptySeatsResponse = await fetch(`${API_BASE_URL}/customers/available`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tripId, startStationId, endStationId })
                });
                const emptySeats = await emptySeatsResponse.json();
                console.log("Empty seats:", emptySeats);
                console.log("TripidTripid", tripId);
                console.log("startID:", startStationId);
                console.log("endID:", endStationId);
                const emptySeatIds = emptySeats.map(seat => seat.seatId);
                

                
        
                // Sắp xếp lại: nhóm theo số hàng
                const rows = 9, cols = 4;
                const seatMap = {}; // Ví dụ: seatMap[1] = {A:..., B:..., C:..., D:...}
        
                allSeats.forEach(seat => {
                    const match = seat.seatNumber.match(/^([A-D])(\d+)$/);
                    if (match) {
                        const colLetter = match[1];
                        const rowNumber = parseInt(match[2]);
                        if (!seatMap[rowNumber]) seatMap[rowNumber] = {};
                        seatMap[rowNumber][colLetter] = seat;
                    }
                });
        
                // Render theo từng hàng
                for (let r = 1; r <= rows; r++) {
                    const rowEl = document.createElement("div");
                    rowEl.className = "row";
        
                    const columns = ['A', 'B', 'C', 'D'];
                    columns.forEach((col, cIdx) => {
                        if (cIdx === 2) {
                            const gap = document.createElement("div");
                            gap.className = "gap";
                            rowEl.appendChild(gap);
                        }
        
                        const seatData = seatMap[r] ? seatMap[r][col] : null;
                        if (seatData) {
                            const isAvailable = emptySeatIds.includes(seatData.idSeat);
        
                            const seat = document.createElement("button");
                            seat.className = "seat";
                            seat.textContent = seatData.seatNumber;
                            seat.dataset.seatid = seatData.idSeat;
        
                            if (!isAvailable) {
                                seat.classList.add("unavailable");
                                seat.disabled = true;
                            } else {
                                seat.addEventListener("click", () => handleSeatClick(seatData.idSeat, seat, seatMapEl.closest('.modal'), tripId));

                            }
        
                            rowEl.appendChild(seat);
                        } else {
                            const emptySeat = document.createElement("div");
                            emptySeat.className = "seat-empty";
                            rowEl.appendChild(emptySeat);
                        }
                    });
        
                    seatMapEl.appendChild(rowEl);
                }
            } catch (error) {
                console.error('Lỗi khi mở modal chọn ghế:', error);
            }
        }
        

        
            
    }
        
            resultTrips.style.display = 'block'; // Hiện kết quả
}
        



// Gọi hàm lúc load trang
fetchStations();
// Hàm mở modal chọn ghế





  
  
  