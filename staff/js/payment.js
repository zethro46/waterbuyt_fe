import CONFIG from "/common/js/setting.js";

const API_BASE_URL = `${CONFIG.BASE_URL}/api`;
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("%cpayment.js loaded", "color: green; font-weight: bold;");

  // Lấy bookingData từ localStorage
  const bookingId = Object.keys(localStorage).find((key) =>
    key.startsWith("bookingData_")
  );
  if (!bookingId) {
    console.error("Không tìm thấy bookingData trong localStorage");
    window.location.href = "/staff/pages/find_trip.html";
    return;
  }

  const bookingData = JSON.parse(localStorage.getItem(bookingId));
  console.log(
    "%cBooking Data:",
    "color: green; font-weight: bold;",
    bookingData
  );

  // Fetch station details
  let startStationName = "Không rõ";
  let endStationName = "Không rõ";
  try {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Fetch stations failed");
    const stations = await response.json();
    console.log(
      "%cFetched stations:",
      "color: green; font-weight: bold;",
      stations
    );

    const stationMap = {};
    stations.forEach((station) => {
      if (station.id && station.name) stationMap[station.id] = station.name;
    });
    startStationName = stationMap[bookingData.startStationId] || "Không rõ";
    endStationName = stationMap[bookingData.endStationId] || "Không rõ";
  } catch (error) {
    console.error("Lỗi fetch danh sách bến:", error);
  }


  
  // Render thông tin vé
  const ticketInfoEl = document.getElementById("ticket-info");
  
  if (ticketInfoEl) {
    const calculateCategoryId = (dobString) => {
      const birth = new Date(dobString);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age < 5) return 1;
      if (age > 80) return 2;
      return 3;
    };

    // Lấy danh sách categoryRequest = [{ idx, categoryId }]
    const categoryRequests = bookingData.details.map((p, i) => ({
      index: i,
      categoryId: calculateCategoryId(p.dob)
    }));

    // Fetch giá vé tương ứng từng category
    const pricePromises = categoryRequests.map(({ categoryId }) =>
      fetch(`${API_BASE_URL}/tickets/latest?categoryId=${categoryId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Không thể lấy giá cho categoryId=${categoryId}`);
          return res.text(); // Lấy chuỗi số trả về
        })
        .then(text => Number(text)) // Ép thành số
    );


    // Chờ lấy hết giá vé
    let prices = [];
    try {
      prices = await Promise.all(pricePromises);
      console.log("Giá vé theo từng hành khách (theo category):", prices);
    } catch (err) {
      console.error("Lỗi khi fetch giá vé:", err);
      ticketInfoEl.innerHTML = `<p>Có lỗi khi lấy thông tin giá vé. Vui lòng thử lại.</p>`;
      return;
    }

    // Tính tổng
    const total = prices.reduce((sum, price) => sum + price, 0);
    ticketInfoEl.innerHTML = `
                    <div class="ticket-header">
                        <img src="/common/assets/images/logo_waterbuyt_fit.png" alt="Company Logo">
                        <h2>WATERBUYT SG</h2>
                    </div>
                    <h3>Thông tin vé</h3>
                    <p><strong>Họ tên:</strong> ${
                      bookingData.fullname || "N/A"
                    }</p>
                    <p><strong>SĐT:</strong> ${bookingData.phone || "N/A"}</p>
                    <p><strong>Email:</strong> ${bookingData.email || "N/A"}</p>
                    <p><strong>Quốc tịch:</strong> ${
                      bookingData.nationality || "N/A"
                    }</p>
                    <p><strong>Chuyến:</strong> ${startStationName} - ${endStationName}</p>
                    <p><strong>Ghế:</strong> ${bookingData.seatNumbers
                      .map((seat) => seat.seats.replace(/^Ghế\s*/i, ""))
                      .join(", ")}</p>
                    <p><strong>Hành khách:</strong></p>
                    <ul>
                        ${
                          bookingData.details
                            ?.map(
                              (p, i) =>
                                `<li>Hành khách ${i + 1}: ${
                                  p.name
                                }, Năm sinh: ${p.dob}</li>`
                            )
                            .join("") || "<li>N/A</li>"
                        }
                    </ul>
                    <p><strong>Tổng tiền:</strong> ${(
                      total
                    ).toLocaleString("vi-VN")} VNĐ</p>
                `;
  } else {
    console.error("Không tìm thấy #ticket-info");
  }

  // Xử lý submit form
  document
    .getElementById("payment-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const paymentMethod = document.querySelector(
        'input[name="payment-method"]:checked'
      ).value;
      console.log("Phương thức thanh toán:", paymentMethod);
      await createBooking(paymentMethod, bookingData);
    });

  // Xử lý nút "Đã thanh toán" cho QR
  document.getElementById("paid-button").addEventListener("click", async () => {
    const tempId = document
      .getElementById("qr-image")
      .getAttribute("data-tempid");
    await confirmQrPayment(tempId, bookingData);
  });
});

// Tạo booking
async function createBooking(paymentMethod, bookingData) {
  const bookingPayload = {
    fullname: String(bookingData.fullname),
    birthYear: Number(bookingData.bookerDOB),
    phone: String(bookingData.phone),
    email: String(bookingData.email),
    nationality: String(bookingData.nationality),
    startStationId: Number(bookingData.startStationId),
    endStationId: Number(bookingData.endStationId),
    tripId: Number(bookingData.tripId),
    staffId: Number(bookingData.staffId),
    paymentMethod: String(paymentMethod),
    seatIds: bookingData.seatIds?.map((seat) => Number(seat.seatId)) || [],
    details:
      bookingData.details?.map((p) => ({
        fullname: String(p.name),
        birthYear: Number(p.dob),
      })) || [],
  };

  try {
    const response = await fetch(`${API_BASE_URL}/customers/createBooking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingPayload),
    });

    console.log(
      "%cBooking Payload:",
      "color: blue; font-weight: bold;",
      bookingPayload
    );
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Tạo booking thất bại");

    if (paymentMethod === "CASH") {
      await saveTicketAsPDF();
      const bookingKey = Object.keys(localStorage).find((key) =>
        key.startsWith("bookingData_")
      );
      if (bookingKey) {
        localStorage.removeItem(bookingKey);
        console.log(`Đã xóa ${bookingKey} khỏi localStorage`);
      }
      setTimeout(() => {
        window.location.href = "/staff/pages/find_trip.html";
      }, 5000);
    } else if (paymentMethod === "QR") {
      showQrAndPaidButton(result.qrCode, result.tempId);
    }
  } catch (error) {
    console.error("Lỗi tạo booking:", error);
    alert("Tạo booking thất bại. Vui lòng thử lại.");
  }
}

// Xác nhận thanh toán QR
async function confirmQrPayment(tempId, bookingData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/customers/confirmQrPayment/${tempId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      console.log("Xác nhận QR thành công");
      await saveTicketAsPDF();
      const bookingKey = Object.keys(localStorage).find((key) =>
        key.startsWith("bookingData_")
      );
      if (bookingKey) {
        localStorage.removeItem(bookingKey);
        console.log(`Đã xóa ${bookingKey} khỏi localStorage`);
      }
      setTimeout(() => {
        window.location.href = "/staff/pages/find_trip.html";
      }, 5000);
    } else {
      const error = await response.json();
      console.error("Lỗi xác nhận QR:", error);
      alert("Xác nhận QR thất bại.");
    }
  } catch (error) {
    console.error("Lỗi xác nhận QR:", error);
    alert("Lỗi hệ thống. Vui lòng thử lại.");
  }
}

// Hiển thị QR và nút "Đã thanh toán"
function showQrAndPaidButton(qrText, tempId) {
  const qrImage = document.getElementById("qr-image");
  if (!qrImage) {
    console.error("Không tìm thấy phần tử #qr-image.");
    return;
  }

  const qrContainer = document.getElementById("qr-container");
  const paidButton = document.getElementById("paid-button");
  const paymentForm = document.getElementById("payment-form");

  if (!qrContainer || !paidButton || !paymentForm) {
    console.error(
      "Không tìm thấy #qr-container, #paid-button hoặc #payment-form."
    );
    return;
  }

  if (!qrText || typeof qrText !== "string") {
    console.error("qrText không hợp lệ hoặc rỗng:", qrText);
    return;
  }

  console.log("Hiển thị mã QR với nội dung:", qrText);

  if (qrImage.tagName.toLowerCase() !== "img") {
    console.warn("#qr-image không phải thẻ <img>. Thay thế bằng thẻ <img>.");
    qrImage.innerHTML = "";
    const img = document.createElement("img");
    img.id = "qr-image";
    img.className = "qr-code";
    img.alt = "QR Code";
    qrImage.parentNode.replaceChild(img, qrImage);
    qrImage = img;
  }

  qrImage.src = `data:image/png;base64,${qrText}`;
  qrImage.setAttribute("data-tempid", tempId);

  qrContainer.style.display = "block";
  paidButton.style.display = "block";
  paymentForm.style.display = "none";
}

// Lưu vé thành PDF
function saveTicketAsPDF() {
  const element = document.getElementById("ticket-info");
  html2pdf()
    .set({
      margin: 0.2,
      filename: "ve_xe.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: [3.5, 8], // Kích thước vé: 3.5in x 8in
        orientation: "portrait",
      },
    })
    .from(element)
    .save();
}
