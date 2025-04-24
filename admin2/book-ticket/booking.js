// Nút đổi nơi đi <-> nơi đến
document.getElementById("switch-btn").addEventListener("click", () => {
    const start = document.getElementById("start-station");
    const end = document.getElementById("end-station");
  
    const temp = start.value;
    start.value = end.value;
    end.value = temp;
  });
  

  
//   // Gọi API khi bấm TÌM VÉ
//   document.getElementById("search-btn").addEventListener("click", () => {
//     const noiDi = document.getElementById("start-station").value;
//     const noiDen = document.getElementById("end-station").value;
//     const ngay = document.getElementById("departure-date").value;
//     const gio = document.getElementById("departure-time").value;
  
//     const apiURL = `http://localhost:8080/api/tim-ve?noiDi=${encodeURIComponent(noiDi)}&noiDen=${encodeURIComponent(noiDen)}&ngay=${ngay}&gio=${gio}`;
  
//     fetch(apiURL)
//       .then(res => res.json())
//       .then(data => {
//         const resultDiv = document.getElementById("result");
//         resultDiv.innerHTML = "";
  
//         if (data.length === 0) {
//           resultDiv.textContent = "Không có chuyến nào.";
//           return;
//         }
  
//         data.forEach(chuyen => {
//           const item = document.createElement("div");
//           item.textContent = `Chuyến: ${chuyen.maChuyen}, Giờ: ${chuyen.gioDi}, Còn: ${chuyen.soVeCon} vé`;
//           resultDiv.appendChild(item);
//         });
//       })
//       .catch(err => {
//         console.error(err);
//         alert("Lỗi khi gọi API.");
//       });
//   });
  