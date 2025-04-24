//Kế thừa header
fetch('/admin2/homepage/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    })
    .catch(error => console.error('Lỗi khi load header:', error));

//Kế thừa footer
fetch('/admin2/homepage/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => console.error('Lỗi khi load footer:', error));

// Nếu muốn đóng menu khi click ngoài vùng dropdown
document.addEventListener("click", e => {
    const dropdown = document.querySelector(".dropdown");
    if (!dropdown.contains(e.target)){
      dropdown.querySelector(".dropdown-content").style.display = "none";
    } else {
      dropdown.querySelector(".dropdown-content").style.display = "flex";
    }
  });

function showStation(stationId) {
    document.querySelectorAll('.station-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(stationId).style.display = 'flex';
    document.querySelectorAll('.station-tab').forEach(tab => {
        tab.classList.remove('active');
    });
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
