function showStation(stationId) {
    // Ẩn tất cả nội dung bến tàu
    document.querySelectorAll('.station-content').forEach(content => {
        content.style.display = 'none';
    });

    // Hiển thị nội dung bến được chọn
    document.getElementById(stationId).style.display = 'flex';

    // Xóa class "active" ở tất cả tab
    document.querySelectorAll('.station-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Thêm class "active" vào tab được click
    document.querySelector(`[onclick="showStation('${stationId}')"]`).classList.add('active');
}

window.addEventListener("scroll", function() {
    let header = document.querySelector(".header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});
