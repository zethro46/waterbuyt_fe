// Nếu muốn đóng menu khi click ngoài vùng dropdown
document.addEventListener("click", e => {
    const dropdown = document.querySelector(".dropdown");
    if (!dropdown.contains(e.target)){
      dropdown.querySelector(".dropdown-content").style.display = "none";
    } else {
      dropdown.querySelector(".dropdown-content").style.display = "flex";
    }
  });
  