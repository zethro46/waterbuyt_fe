import CONFIG from '/common/js/setting.js';

const API_BASE_URL = `${CONFIG.BASE_URL}/api/admin/login`;

const routes = {
    admin: [
        { path: '/admin3/pages/dashboard.html' },
    ],
    staff: [
        { path: '/staff/pages/find_trip.html'},
    ]
};

function navigateToRoleBasedRoute(role) {
    const userRoutes = routes[role];
    if (!userRoutes) {
        console.error('Role not found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    const defaultRoute = userRoutes[0];
    window.location.href = defaultRoute.path;
}


async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        

        if (response.ok) {
            console.log(`Login successful! Role: ${data.role}`);
            alert('Đăng nhập thành công!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('id', data.id);

            navigateToRoleBasedRoute(data.role);
            // window.location.href = "home.html";
        } else {
            console.log(`Error: ${JSON.stringify(data)}`);
            alert('Đăng nhập thất bại: ' + data.error);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        alert('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    }
}

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    login();
});