/* file: src/pages/cart/cart.js */

document.addEventListener('DOMContentLoaded', () => {
    renderCart();      // Vẽ giỏ hàng chính
    updateCartSummary(); // Cập nhật tổng tiền

    // Gắn sự kiện cho nút Checkout (Mở Slide)
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', openCheckoutSlide);
    }
});

/* =========================================
   PHẦN 1: LOGIC GIỎ HÀNG (MAIN CART)
   ========================================= */

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const container = document.querySelector('.cart-items-container');
    const emptyMsg = document.querySelector('.cart-header p');

    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <h3>Your bag is empty</h3>
                <a href="../index/index.html" style="color:#4f6bf5; text-decoration:underline; font-weight:bold;">Go Shopping</a>
            </div>`;
        if (emptyMsg) emptyMsg.style.display = 'none';
        updateCartSummary();
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'block';

    cart.forEach((item, index) => {
        const imgSrc = item.image ? item.image : 'https://via.placeholder.com/150';
        const html = `
        <div class="cart-item">
            <div class="cart-item-img">
                <img src="${imgSrc}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="item-header">
                    <span class="item-title">${item.name}</span>
                    <span class="item-price">$${item.price.toFixed(2)}</span>
                </div>
                <span class="item-subtitle">Size: ${item.size}</span>
                <span class="item-subtitle">Color: ${item.color || 'Standard'}</span>
                
                <div class="item-controls">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <label>Qty:</label>
                        <select class="cart-select" onchange="updateQuantity(${index}, this.value)">
                            ${renderQtyOptions(item.quantity)}
                        </select>
                    </div>
                </div>

                <div class="cart-actions">
                    <i class="fa-regular fa-trash-can action-icon" onclick="removeItem(${index})" title="Remove"></i>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function renderQtyOptions(selected) {
    let options = '';
    for (let i = 1; i <= 10; i++) {
        options += `<option value="${i}" ${i == selected ? 'selected' : ''}>${i}</option>`;
    }
    return options;
}

function updateQuantity(index, newQty) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart[index].quantity = parseInt(newQty);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    renderCart();
    updateCartSummary();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    renderCart();
    updateCartSummary();
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 6.99 : 0;
    const total = subtotal + shipping;

    // Cập nhật giao diện Main Cart
    const elItems = document.getElementById('summary-total-items');
    const elPrice = document.getElementById('summary-total-price');
    const elTotal = document.getElementById('summary-final-total');

    if (elItems) elItems.innerText = `${totalItems} ITEMS`;
    if (elPrice) elPrice.innerText = `$${subtotal.toFixed(2)}`;
    if (elTotal) elTotal.innerText = `$${total.toFixed(2)}`;
}


/* =========================================
   PHẦN 2: LOGIC CHECKOUT SLIDE & THANH TOÁN
   ========================================= */

// 1. Mở Slide Checkout (Thay vì alert ngay)
function openCheckoutSlide() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    if (cart.length === 0) {
        alert("Your bag is empty!");
        return;
    }

    // Render danh sách sản phẩm nhỏ bên trong Slide
    renderCheckoutMiniItems(cart);
    
    // Hiển thị Panel
    document.getElementById('checkout-panel').classList.add('active');
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
}

// 2. Đóng Slide Checkout
function closeCheckout() {
    document.getElementById('checkout-panel').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// 3. Render sản phẩm trong Slide (Mini list)
function renderCheckoutMiniItems(cart) {
    const container = document.getElementById('checkout-items-list');
    if(!container) return;
    
    let subtotal = 0;
    let html = '';

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const imgSrc = item.image ? item.image : 'https://via.placeholder.com/150';
        html += `
            <div class="co-item">
                <div class="co-img">
                    <img src="${imgSrc}" alt="${item.name}">
                </div>
                <div class="co-info">
                    <div class="co-name">${item.name}</div>
                    <span class="co-sub">Size: ${item.size} | Qty: ${item.quantity}</span>
                    <span class="co-price">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Cập nhật giá tiền trong Slide
    const shipping = 6.00;
    const total = subtotal + shipping;

    document.getElementById('co-total-items').innerText = `${cart.length} ITEMS`;
    document.getElementById('co-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('co-final-total').innerText = `$${total.toFixed(2)}`;
}

// 4. Hàm tạo ID Đơn hàng (Unique)
function generateOrderId() {
    // ID dạng: ORD-timestamp-sốngẫunhhiên (VD: ORD-17023456789-123)
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// 5. XỬ LÝ THANH TOÁN CUỐI CÙNG (Nút "REVIEW AND PAY")
function processPayment() {
    // A. Lấy user hiện tại
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        currentUser = users.find(u => u.id === 1) || { id: 1, name: "Guest" };
    }

    // B. Lấy thông tin giỏ hàng & tính tiền
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 6.00; // Shipping

    // C. Tạo Object Order
    const newOrder = {
        orderId: generateOrderId(),
        userId: currentUser.id,
        customerName: currentUser.name,
        email: document.getElementById('checkout-email')?.value || currentUser.email || "No Email",
        date: new Date().toISOString(),
        items: cart,
        totalPrice: total,
        status: 'Pending',
        shippingAddress: "Standard Delivery Address" 
    };

    // D. Lưu vào danh sách chung (Admin)
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

    // E. Lưu vào lịch sử User
    let usersList = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = usersList.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        if (!usersList[userIndex].orders) usersList[userIndex].orders = [];
        usersList[userIndex].orders.push(newOrder);
        localStorage.setItem('users', JSON.stringify(usersList));
    }

    // F. Dọn dẹp & Thông báo
    localStorage.removeItem('shoppingCart'); // Xóa giỏ hàng
    closeCheckout(); // Đóng slide
    renderCart(); // Render lại trang cart (giờ đã trống)
    
    // Thông báo đẹp
    alert(`🎉 THANH TOÁN THÀNH CÔNG!\n\nMã đơn hàng: ${newOrder.orderId}\nTổng tiền: $${total.toFixed(2)}\n\nCảm ơn bạn đã mua hàng tại KICKS!`);
}