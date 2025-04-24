import CONFIG from '/common/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api/staffs`;

document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const profileContainer = document.querySelector('.profile-container');
    
    const id = localStorage.getItem('id');
    const role = localStorage.getItem('role');

    if (!id || !role) {
        loading.innerText = 'Không tìm thấy thông tin đăng nhập.';
        return;
    }

    // Gọi API lấy thông tin nhân viên
    fetch(`${API_BASE_URL}/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu nhân viên');
            }
            return response.json();
        })
        .then(data => {
            // Đưa dữ liệu vào trang
            document.getElementById('employee-name').innerText = data.fullName;
            document.getElementById('employee-role').innerText = role;
            document.getElementById('identityNumber').innerText = data.identityNumber;
            document.getElementById('birthDate').innerText = data.birthDate;
            document.getElementById('gender').innerText = data.gender;
            document.getElementById('phone').innerText = data.phone;
            document.getElementById('email').innerText = data.email;
            document.getElementById('address').innerText = data.address;
            document.title = data.fullName;

            // Hiển thị thông tin, ẩn loading
            loading.style.display = 'none';
            profileContainer.style.display = 'block';
        })
        .catch(error => {
            console.error(error);
            loading.innerText = 'Lỗi tải dữ liệu nhân viên.';
        });
});
