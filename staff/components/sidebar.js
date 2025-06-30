document.getElementById("sidebar").innerHTML = `
    <div class="logo">
        <img alt="logo system" src="/common/assets/images/logo_waterbuyt_fit.png" />
    </div>

    <ul class="menu">
        <li><a href="/staff/pages/find_trip.html">
                <i class="fa-solid fa-ticket"></i>
                Book Ticket
            </a></li>
            
        <li><a href="/staff/pages/passenger.html">
                <i class="fa-solid fa-user-group"></i>
                Booking Details
            </a></li>

        <li><a href="/staff/pages/profile.html">
                <i class="fa-solid fa-circle-user"></i>
                Profile
            </a></li>

        <li><a href="/admin2/homepage/index.html" class="logout-link">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                Log Out
            </a></li>
    </ul>
`;

document.addEventListener("DOMContentLoaded", function() {
    // Thêm lớp active cho liên kết hiện tại
    const menuLinks = document.querySelectorAll("#sidebar .menu li a");
    const currentPath = window.location.pathname;

    menuLinks.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });

    // Xử lý sự kiện đăng xuất
    const logoutLink = document.querySelector("#sidebar .logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function(event) {
            event.preventDefault(); 
            localStorage.clear(); 
            window.location.href = "/admin2/homepage/index.html"; 
        });
    }
});