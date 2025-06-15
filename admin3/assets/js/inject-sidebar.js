document.addEventListener("DOMContentLoaded", function () {
  fetch("../components/sidebar.html")
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      document.body.querySelector(".wrapper").prepend(wrapper.firstElementChild);

      // Gán class active theo URL
      const current = location.pathname.split("/").pop();
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("href") === current) {
          link.classList.add("active");
        }
      });
    });
});
