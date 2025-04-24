

function openSeatModal(button) {
  const card = button.closest(".trip-card");
  const modal = card.querySelector(".modal");

  modal.classList.toggle("active");
}

function resetModal(modal) {
  // Reset ghế đã chọn
  const selectedSeats = modal.querySelectorAll('.seat.selected');
  selectedSeats.forEach(seat => seat.classList.remove('selected'));

  // Reset các ô input text
  const inputs = modal.querySelectorAll('input');
  inputs.forEach(input => input.value = '');

  // Reset các ô select
  const selects = modal.querySelectorAll('select');
  selects.forEach(select => select.selectedIndex = 0);

  // Reset các thông tin liên quan đến đặt vé
  const seatList = modal.querySelector('#seat-list');
  if (seatList) seatList.innerText = 'Vui lòng chọn ít nhất 1 chỗ ngồi';

  const totalPrice = modal.querySelector('#total-price');
  if (totalPrice) totalPrice.innerText = '0';

  // Reset nút tiếp tục (nếu có)
  const continueBtn = modal.querySelector('#continue-btn');
  if (continueBtn) continueBtn.disabled = true;
}

  // Nếu modal đang mở và chưa có ghế thì mới render ghế
const PRICE_PER_SEAT = 15000;
const MAX_SEATS = 6;
const seatMapEl = document.getElementById("seat-map");
const seatListEl = document.getElementById("seat-list");
const totalPriceEl = document.getElementById("total-price");
const continueBtn = document.getElementById("continue-btn");
const notificationEl = document.getElementById("notification");

let selectedSeats = [];

function formatPrice(number) {
return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatSeatLabel(row, col) {
return String.fromCharCode(65 + row) + (col + 1);
}

function updateSummary() {
if (selectedSeats.length === 0) {
  seatListEl.textContent = "Vui lòng chọn ít nhất 1 chỗ ngồi";
  continueBtn.disabled = true;
  continueBtn.classList.remove("enabled");
} else {
  seatListEl.textContent = "Ghế " + selectedSeats.map(([r, c]) => formatSeatLabel(r, c)).join(", ");
  continueBtn.disabled = false;
  continueBtn.classList.add("enabled");
}
totalPriceEl.textContent = formatPrice(selectedSeats.length * PRICE_PER_SEAT);
}

function handleSeatClick(row, col, seatEl) {
const isSelected = selectedSeats.some(([r, c]) => r === row && c === col);
if (isSelected) {
  selectedSeats = selectedSeats.filter(([r, c]) => !(r === row && c === col));
  seatEl.classList.remove("selected");
} else if (selectedSeats.length < MAX_SEATS) {
  selectedSeats.push([row, col]);
  seatEl.classList.add("selected");
}

renderSeats(); // re-render để áp dụng disabled
updateSummary();
}

function renderSeats() {
seatMapEl.innerHTML = "";
const rows = 7, cols = 6;

for (let r = 0; r < rows; r++) {
  const rowEl = document.createElement("div");
  rowEl.className = "row";

  for (let c = 0; c < cols; c++) {
    if (c === 3) {
      const gap = document.createElement("div");
      gap.className = "gap";
      rowEl.appendChild(gap);
    }

    const seat = document.createElement("div");
    seat.className = "seat";
    seat.textContent = formatSeatLabel(r, c);

    const isUnavailable = r === 5 && !(c > 0 && c < 5);
    const isSelected = selectedSeats.some(([sr, sc]) => sr === r && sc === c);
    const isDisabled = !isSelected && selectedSeats.length >= MAX_SEATS;

    if (isUnavailable) seat.classList.add("unavailable");
    else if (isSelected) seat.classList.add("selected");
    else if (isDisabled) seat.classList.add("disabled");

    if (!isUnavailable && !isDisabled) {
      seat.addEventListener("click", () => handleSeatClick(r, c, seat));
    }

    rowEl.appendChild(seat);
  }

  seatMapEl.appendChild(rowEl);
}

// Show/hide max seat warning
if (selectedSeats.length >= MAX_SEATS) {
  notificationEl.textContent = `Bạn đã chọn tối đa ${MAX_SEATS} ghế. Để chọn ghế khác, vui lòng bỏ chọn một ghế trước.`;
  notificationEl.classList.remove("hidden");
} else {
  notificationEl.classList.add("hidden");
}
}

renderSeats();
updateSummary();

function closeSeatModal(closeBtn) {
  const modal = closeBtn.closest(".modal");
  modal.classList.remove("active");
}

document.getElementById('continue-btn').addEventListener('click', function() {
  const seatListText = document.getElementById('seat-list').innerText;
  const seats = seatListText.split(',').map(seat => seat.trim()).filter(seat => seat);

  if (seats.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế');
      return;
  }

  // Ẩn modal
  document.querySelector('.modal-content').style.display = 'none';

  // Hiện passenger-infor
  document.getElementById('passenger-infor').style.display = 'block';

  // Sinh form
  const passengerList = document.getElementById('passenger-list');
  passengerList.innerHTML = '';

  seats.forEach((seat, index) => {
      const div = document.createElement('div');
      div.classList.add('passenger-form-group');
      div.innerHTML = `
          <label>Hành khách ${index + 1}</label>
          <input type="text" placeholder="Họ và tên" name="passenger-name-${index}" required>
          <input type="number" placeholder="Năm sinh (VD: 1995)" name="passenger-dob-${index}" min="1900" max="2025" required>
      `;
      passengerList.appendChild(div);
  });
});


// Nút Back
document.getElementById('back-to-seat').addEventListener('click', function() {
  document.getElementById('passenger-infor').style.display = 'none';
  document.querySelector('.modal-content').style.display = 'block';
});

// Nút Đóng (icon X)
document.querySelector('.close-passenger-infor').addEventListener('click', function() {
  document.getElementById('passenger-infor').style.display = 'none';
});


