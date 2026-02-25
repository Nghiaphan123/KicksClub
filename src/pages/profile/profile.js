document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra đăng nhập
    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) {
        alert("Please log in to view your profile.");
        window.location.href = '../auth/auth.html';
        return;
    }

    // 2. Lấy dữ liệu đầy đủ của User từ mảng 'users'
    const usersList = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = usersList.findIndex(u => u.id === currentUserInfo.id);
    
    if (userIndex === -1) {
        alert("Lỗi dữ liệu tài khoản!");
        return;
    }
    const fullUserData = usersList[userIndex];

    // 3. Đổ dữ liệu vào Form
    document.getElementById('display-user-name').innerText = fullUserData.name;
    document.getElementById('prof-name').value = fullUserData.name;
    document.getElementById('prof-email').value = fullUserData.email;
    document.getElementById('prof-address').value = fullUserData.address || "";

    // 4. Xử lý lưu thông tin mới (Cập nhật User)
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newName = document.getElementById('prof-name').value.trim();
        const newAddress = document.getElementById('prof-address').value.trim();
        const newPassword = document.getElementById('prof-password').value;

        // Cập nhật mảng users
        usersList[userIndex].name = newName;
        usersList[userIndex].address = newAddress;
        if (newPassword !== "") {
            usersList[userIndex].password = newPassword; // Đổi pass nếu có nhập
        }

        // Lưu lại vào LocalStorage
        localStorage.setItem('users', JSON.stringify(usersList));

        // Cập nhật luôn biến currentUser
        currentUserInfo.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUserInfo));

        document.getElementById('display-user-name').innerText = newName;
        document.getElementById('prof-password').value = ""; // Xóa trắng ô pass
        alert("Cập nhật thông tin thành công!");
    });

    // 5. Render Lịch sử đơn hàng
    renderOrders(fullUserData.orders || []);
});

// --- HÀM CHUYỂN TAB ---
function switchTab(tabId) {
    // Đổi màu menu
    document.querySelectorAll('.profile-nav li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Hiện nội dung tương ứng
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- HÀM RENDER ĐƠN HÀNG ---
function renderOrders(ordersArray) {
    const container = document.getElementById('orders-list-container');
    
    if (ordersArray.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 8px;">
                <i class="fas fa-box-open" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                <p>Bạn chưa có đơn hàng nào.</p>
                <a href="../index/index.html" style="color: #4f6bf5; font-weight: bold; text-decoration: none;">Đi mua sắm ngay</a>
            </div>`;
        return;
    }

    let html = '';
    // Đảo ngược mảng để đơn hàng mới nhất lên đầu
    [...ordersArray].reverse().forEach(order => {
        // Tạo chuỗi HTML cho danh sách sản phẩm trong đơn đó
        let itemsHtml = '';
        order.items.forEach(item => {
            const imgSrc = item.image ? item.image : 'https://via.placeholder.com/50';
            itemsHtml += `
                <div class="order-item-mini">
                    <img src="${imgSrc}" alt="${item.name}">
                    <div>
                        <div style="font-weight: 700;">${item.name}</div>
                        <div style="color: #666;">Size: ${item.size} | Qty: ${item.quantity}</div>
                    </div>
                </div>
            `;
        });

        const dateStr = new Date(order.date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const statusClass = order.status.toLowerCase() === 'completed' ? 'completed' : 'pending';

        html += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="o-id">${order.orderId}</div>
                        <div class="o-date">${dateStr}</div>
                    </div>
                    <div class="o-status ${statusClass}">${order.status}</div>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                <div class="order-total">
                    Total: $${order.totalPrice.toFixed(2)}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// --- HÀM ĐĂNG XUẤT ---
function logoutUser() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('currentUser');
        window.location.href = '../auth/auth.html';
    }
}