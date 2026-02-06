document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartIconCount(); // Optional: if you have a cart icon in the header
});

// Function to format currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

function renderCart() {
    // 1. Get cart data from LocalStorage
    // Key must match what you used in index.js ('shoppingCart')
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    const cartContainer = document.querySelector('.cart-items-container'); // You need to add this class to your HTML wrapper for items
    const summaryContainer = document.querySelector('.cart-summary-section');
    
    // Elements for Summary
    const totalItemsEl = document.getElementById('summary-total-items');
    const totalPriceEl = document.getElementById('summary-total-price');
    const finalTotalEl = document.getElementById('summary-final-total');

    // 2. Handle Empty Cart
    if (cart.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <h3>Your bag is empty</h3>
                    <p>Start adding some kicks to your collection.</p>
                    <a href="../index/index.html">Go Shopping</a>
                </div>
            `;
        }
        // Update summary to zero
        if(totalItemsEl) totalItemsEl.innerText = "0 ITEMS";
        if(totalPriceEl) totalPriceEl.innerText = "$0.00";
        if(finalTotalEl) finalTotalEl.innerText = "$0.00";
        return;
    }

    // 3. Render Cart Items
    if (cartContainer) {
        let html = '';
        let subtotal = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            // Calculate item totals
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            // Default image if missing (error handling)
            const imgSrc = item.image ? item.image : 'https://via.placeholder.com/150';

            html += `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${imgSrc}" alt="${item.name}">
                </div>
                
                <div class="cart-item-info">
                    <div class="item-top-row">
                        <span class="item-title">${item.name}</span>
                        <span class="item-price">${formatPrice(item.price)}</span>
                    </div>
                    
                    <span class="item-subtitle">Men's Road Running Shoes</span>
                    <span class="item-subtitle">${item.color || 'Standard Color'}</span>
                    
                    <div class="item-controls">
                        <div class="control-group">
                            <label>Size</label>
                            <select class="cart-select" onchange="updateItemSize(${index}, this.value)">
                                <option value="${item.size}" selected>${item.size}</option>
                                </select>
                        </div>

                        <div class="control-group">
                            <label>Quantity</label>
                            <select class="cart-select" onchange="updateItemQuantity(${index}, this.value)">
                                ${generateQuantityOptions(item.quantity)}
                            </select>
                        </div>
                    </div>

                    <div class="item-actions">
                        <i class="far fa-heart action-icon" title="Move to Favorites"></i>
                        <i class="far fa-trash-alt action-icon" onclick="removeItem(${index})" title="Remove"></i>
                    </div>
                </div>
            </div>
            `;
        });

        cartContainer.innerHTML = html;

        // 4. Update Order Summary
        const shipping = 6.99;
        const total = subtotal + shipping;

        if(totalItemsEl) totalItemsEl.innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
        if(totalPriceEl) totalPriceEl.innerText = formatPrice(subtotal);
        if(finalTotalEl) finalTotalEl.innerText = formatPrice(total);
    }
}

// Helper to generate quantity dropdown options (1-10)
function generateQuantityOptions(currentQty) {
    let options = '';
    for (let i = 1; i <= 10; i++) {
        options += `<option value="${i}" ${i == currentQty ? 'selected' : ''}>${i}</option>`;
    }
    return options;
}

// Function to remove item
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart.splice(index, 1); // Remove item at index
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // Re-render
    renderCart();
    updateCartIconCount();
}

// Function to update quantity
function updateItemQuantity(index, newQty) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cart[index]) {
        cart[index].quantity = parseInt(newQty);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        renderCart();
        updateCartIconCount();
    }
}

// Function to update cart icon count in header (optional)
function updateCartIconCount() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countBadge = document.querySelector('.cart-count'); // Make sure your header has this class
    if (countBadge) {
        countBadge.innerText = totalItems;
        countBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// --- LOGIC THANH TOÁN (CHECKOUT) ---

// 1. Hàm tạo mã đơn hàng ngẫu nhiên (Ví dụ: #ORD-1709283021-999)
function generateOrderId() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${randomNum}`;
}

// 2. Hàm xử lý sự kiện khi bấm nút Checkout
function handleCheckout() {
    // A. Lấy dữ liệu giỏ hàng
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // B. Kiểm tra giỏ hàng trống
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống! Hãy mua sắm thêm nhé.");
        return;
    }

    // C. Lấy thông tin người dùng hiện tại (Giả sử đã lưu lúc đăng nhập)
    // Nếu chưa làm đăng nhập, ta lấy tạm user đầu tiên hoặc user ID = 5 (Hoàng Văn Thái)
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Fallback: Nếu không có ai đăng nhập, ta lấy user ID 1 làm mặc định để test
    if (!currentUser) {
        // Lấy danh sách users gốc để tìm
        const users = JSON.parse(localStorage.getItem('users')) || []; 
        currentUser = users.find(u => u.id === 1) || { id: 1, name: "Khách vãng lai" };
    }

    // D. Tính toán tổng tiền
    const shipping = 6.99;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shipping;

    // E. TẠO OBJECT ORDER (QUAN TRỌNG)
    const newOrder = {
        orderId: generateOrderId(),      // ID riêng biệt
        userId: currentUser.id,          // ID người mua
        customerName: currentUser.name,  // Tên người mua (lưu cứng để tiện tra cứu)
        date: new Date().toISOString(),  // Thời gian mua
        items: cart,                     // Toàn bộ sản phẩm trong giỏ biến thành items của đơn hàng
        totalPrice: total,
        status: "Pending",               // Trạng thái mặc định: Chờ xử lý
        shippingAddress: "Địa chỉ mặc định" // (Có thể update logic lấy địa chỉ sau)
    };

    // F. LƯU ĐƠN HÀNG (2 Nơi)

    // Nơi 1: Lưu vào danh sách tổng tất cả đơn hàng (dành cho Admin xem)
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

    // Nơi 2: Cập nhật vào mảng 'users' (Lưu vào lịch sử mua hàng của người đó)
    // (Bước này quan trọng để đồng bộ dữ liệu người dùng)
    let usersList = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = usersList.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Nếu tìm thấy user, push order vào mảng orders của họ
        if (!usersList[userIndex].orders) {
            usersList[userIndex].orders = [];
        }
        usersList[userIndex].orders.push(newOrder);
        // Lưu ngược lại danh sách users
        localStorage.setItem('users', JSON.stringify(usersList));
    }

    // G. XÓA GIỎ HÀNG & THÔNG BÁO
    localStorage.removeItem('shoppingCart'); // Xóa key giỏ hàng
    
    // Render lại giao diện giỏ hàng (để nó hiện trống trơn)
    renderCart();
    updateCartIconCount();

    // Thông báo và chuyển trang (nếu có trang Thank You)
    alert(`Đặt hàng thành công!\nMã đơn hàng của bạn là: ${newOrder.orderId}\nTổng tiền: $${total.toFixed(2)}`);
    
    // window.location.href = '../orders/orders.html'; // Bỏ comment dòng này nếu bạn có trang lịch sử đơn hàng
}

// 3. GẮN SỰ KIỆN CHO NÚT CHECKOUT
// Đợi DOM load xong mới tìm nút
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});