/* ============================================================
   KICKS - index.js
   Tích hợp: Products Data + Users Init + Auth Guard +
             Cart↔User Sync + Filter + Grid + Detail + Mini Cart
============================================================ */

/* ============================================================
   1. PRODUCT DATA
============================================================ */

/* ============================================================
   3. HELPERS DÙNG CHUNG
============================================================ */
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

/* ============================================================
   4. CART ↔ USER SYNC
============================================================ */

// Khi vào trang: load cart từ user đang đăng nhập vào shoppingCart
function loadCartFromUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (user && Array.isArray(user.cart)) {
        localStorage.setItem('shoppingCart', JSON.stringify(user.cart));
    }
}

// Sau mỗi thay đổi cart: ghi ngược vào users[]
function syncCartToUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        users[idx].cart = cart;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

/* ============================================================
   5. TOAST NOTIFICATION
============================================================ */
function showToast(message, type = 'success', duration = 3000) {
    // Inject styles once
    if (!document.getElementById('kicks-toast-style')) {
        const style = document.createElement('style');
        style.id = 'kicks-toast-style';
        style.innerHTML = `
            #kicks-toast-container {
                position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                z-index: 99999; display: flex; flex-direction: column;
                align-items: center; gap: 10px; pointer-events: none;
            }
            .kicks-toast {
                display: flex; align-items: center; gap: 12px;
                background: #222; color: #fff;
                padding: 14px 22px; border-radius: 12px;
                font-family: 'Rubik', sans-serif; font-size: 14px; font-weight: 600;
                box-shadow: 0 8px 30px rgba(0,0,0,0.25);
                animation: toastIn 0.35s cubic-bezier(.21,1.02,.73,1) forwards;
                pointer-events: all; max-width: 380px;
                border-left: 4px solid #4f6bf5;
            }
            .kicks-toast.success { border-left-color: #4f6bf5; }
            .kicks-toast.error   { border-left-color: #e74c3c; background: #2d1010; }
            .kicks-toast.info    { border-left-color: #f39c12; }
            .kicks-toast.out     { animation: toastOut 0.3s ease forwards; }
            .kicks-toast img {
                width: 42px; height: 42px; border-radius: 6px;
                object-fit: cover; flex-shrink: 0; background: #444;
            }
            .kicks-toast-body { display: flex; flex-direction: column; gap: 2px; }
            .kicks-toast-title { font-size: 13px; opacity: 0.7; font-weight: 500; }
            .kicks-toast-msg   { font-size: 14px; font-weight: 700; }
            @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
            @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(10px) scale(0.95); } }
        `;
        document.head.appendChild(style);
    }
    // Create container if not present
    let container = document.getElementById('kicks-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'kicks-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `kicks-toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
}

function showCartToast(product, size, color) {
    showToast(`
        <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
        <div class="kicks-toast-body">
            <span class="kicks-toast-title">Added to cart ✓</span>
            <span class="kicks-toast-msg">${product.name}</span>
            <span style="font-size:12px;opacity:0.65;font-weight:500;">Size ${size} · ${color}</span>
        </div>
    `, 'success', 3000);
}

/* ============================================================
   5b. PAGE NAVIGATION (SPA)
============================================================ */
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
    if (pageId === 'page-cart') {
        renderCart();
        updateCartSummary();
        const btnCheckout = document.querySelector('.btn-checkout');
        if (btnCheckout) btnCheckout.onclick = openCheckoutSlide;
        updateCartPageHeader();
    }
    if (pageId === 'page-index') {
        updateHeaderGreeting();
        updateCartIconCount();
    }
}

/* ============================================================
   6. AUTH MODAL
============================================================ */
function openAuthModal(form) {
    document.getElementById('auth-modal').classList.add('active');
    toggleAuthForm(form || 'login');
}
function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}
function toggleAuthForm(form) {
    const login = document.getElementById('login-container');
    const reg   = document.getElementById('register-container');
    if (form === 'register') { login.classList.add('hidden'); reg.classList.remove('hidden'); }
    else                     { reg.classList.add('hidden');   login.classList.remove('hidden'); }
}

// ĐĂNG KÝ
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs   = this.querySelectorAll('input:not([type="submit"])');
    const name     = inputs[0].value.trim();
    const email    = inputs[1].value.trim();
    const password = inputs[2].value;
    const confirm  = inputs[3].value;

    if (password !== confirm) { alert('Passwords do not match!'); return; }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        alert('Email này đã được đăng ký. Vui lòng đăng nhập.');
        return;
    }

    const newUser = {
        id: Date.now(), name, email, password,
        role: 'customer', status: 'active',
        address: [], cart: [], orders: []
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
    this.reset();
    toggleAuthForm('login');
});

// ĐĂNG NHẬP
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs   = this.querySelectorAll('input:not([type="submit"])');
    const email    = inputs[0].value.trim();
    const password = inputs[1].value;

    const users = getUsers();
    const user  = users.find(u => u.email === email);

    if (!user)                    { alert('Không tìm thấy tài khoản. Vui lòng đăng ký.'); return; }
    if (user.status === 'banned') { alert('Tài khoản của bạn đã bị khóa.'); return; }
    if (user.password !== password){ alert('Sai mật khẩu.'); return; }

    // Lưu currentUser
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id, name: user.name, email: user.email, role: user.role
    }));

    // Load cart của user vào shoppingCart
    if (Array.isArray(user.cart) && user.cart.length > 0) {
        localStorage.setItem('shoppingCart', JSON.stringify(user.cart));
    } else {
        localStorage.removeItem('shoppingCart');
    }

    closeAuthModal();
    updateHeaderGreeting();
    updateCartPageHeader();
    updateCartIconCount();
    cartBottom.renderCart();
    alert('Đăng nhập thành công! Chào mừng, ' + user.name + '!');
});

/* ============================================================
   7. PROFILE MODAL
============================================================ */
function openProfileModal() {
    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) { openAuthModal('login'); return; }

    const usersList  = getUsers();
    const userIndex  = usersList.findIndex(u => u.id === currentUserInfo.id);
    if (userIndex === -1) { alert('Lỗi dữ liệu tài khoản!'); return; }

    const fullUser = usersList[userIndex];
    document.getElementById('display-user-name').innerText = fullUser.name;
    document.getElementById('prof-name').value             = fullUser.name;
    document.getElementById('prof-email').value            = fullUser.email;
    document.getElementById('prof-password').value         = '';

    renderProfileAddressList(fullUser.address || []);
    renderOrdersList(fullUser.orders || []);

    // Reset tab về Account Details
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-info').classList.add('active');
    document.querySelectorAll('.profile-nav li').forEach(li => li.classList.remove('active'));
    document.querySelector('.profile-nav li').classList.add('active');

    document.getElementById('profile-modal').classList.add('active');
}

// Render danh sách địa chỉ dạng ol trong profile
function renderProfileAddressList(addresses) {
    const container = document.getElementById('prof-address-list');
    if (!container) return;

    if (!addresses || addresses.length === 0) {
        container.innerHTML = `
            <p style="color:#999;font-size:13px;margin-bottom:10px;">Chưa có địa chỉ nào được lưu.</p>`;
    } else {
        const items = addresses.map((addr, i) => `
            <li style="
                padding:12px 16px; border:2px solid ${addr.isDefault ? '#4f6bf5' : '#e0e0e0'};
                border-radius:10px; margin-bottom:8px; cursor:pointer;
                background:${addr.isDefault ? '#f0f4ff' : '#fff'};
                transition:all 0.2s;
                display:flex; justify-content:space-between; align-items:flex-start; gap:10px;
            " onclick="setDefaultAddress(${i})">
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:13px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">
                        ${addr.type}
                        ${addr.isDefault ? '<span style="margin-left:8px;background:#4f6bf5;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;">Default</span>' : ''}
                    </div>
                    <div style="font-size:14px;color:#222;">${addr.content}</div>
                </div>
                <button onclick="event.stopPropagation();deleteProfileAddress(${i})"
                    style="background:none;border:none;color:#ccc;cursor:pointer;font-size:16px;padding:0 4px;line-height:1;"
                    title="Xóa địa chỉ">✕</button>
            </li>`).join('');
        container.innerHTML = `<ol style="list-style:none;padding:0;margin-bottom:10px;">${items}</ol>`;
    }

    // Always show add-new-address form toggle
    container.innerHTML += `
        <div id="prof-new-addr-wrap" style="margin-top:4px;">
            <button type="button" onclick="toggleProfileNewAddrForm()"
                style="background:none;border:2px dashed #ccc;border-radius:10px;width:100%;
                       padding:10px;color:#888;font-weight:600;font-size:13px;cursor:pointer;
                       transition:all 0.2s;" id="btn-prof-add-addr">
                + Thêm địa chỉ mới
            </button>
            <div id="prof-new-addr-form" style="display:none;margin-top:10px;">
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <input id="prof-new-addr-type" type="text" placeholder="Loại (VD: Nhà riêng)"
                        style="flex:1;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                    <input id="prof-new-addr-content" type="text" placeholder="Địa chỉ đầy đủ"
                        style="flex:2;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                </div>
                <button type="button" onclick="saveProfileNewAddress()"
                    style="background:#4f6bf5;color:#fff;border:none;padding:10px 20px;
                           border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">
                    Lưu địa chỉ
                </button>
            </div>
        </div>`;
}

function toggleProfileNewAddrForm() {
    const form = document.getElementById('prof-new-addr-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveProfileNewAddress() {
    const typeInput    = document.getElementById('prof-new-addr-type');
    const contentInput = document.getElementById('prof-new-addr-content');
    const type    = typeInput?.value.trim() || 'Nhà riêng';
    const content = contentInput?.value.trim();
    if (!content) { showToast('<span>Vui lòng nhập địa chỉ!</span>', 'error'); return; }

    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === currentUserInfo.id);
    if (idx === -1) return;

    if (!Array.isArray(users[idx].address)) users[idx].address = [];
    const isFirst = users[idx].address.length === 0;
    users[idx].address.push({ id: 'addr_' + Date.now(), type, content, isDefault: isFirst });
    localStorage.setItem('users', JSON.stringify(users));

    showToast(`<span>Đã lưu địa chỉ mới! ✓</span>`, 'success');
    renderProfileAddressList(users[idx].address);
}

function setDefaultAddress(index) {
    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === currentUserInfo.id);
    if (idx === -1) return;
    users[idx].address.forEach((a, i) => a.isDefault = (i === index));
    localStorage.setItem('users', JSON.stringify(users));
    renderProfileAddressList(users[idx].address);
}

function deleteProfileAddress(index) {
    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === currentUserInfo.id);
    if (idx === -1) return;
    users[idx].address.splice(index, 1);
    // If deleted was default, set first as default
    if (users[idx].address.length > 0 && !users[idx].address.some(a => a.isDefault)) {
        users[idx].address[0].isDefault = true;
    }
    localStorage.setItem('users', JSON.stringify(users));
    renderProfileAddressList(users[idx].address);
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('active');
}

function switchTab(e, tabId) {
    document.querySelectorAll('.profile-nav li').forEach(li => li.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

function logoutUser() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('shoppingCart'); // Xóa cart tạm
        closeProfileModal();
        updateHeaderGreeting();
        updateCartPageHeader();
        updateCartIconCount();
        cartBottom.renderCart();
    }
}

// LƯU THÔNG TIN PROFILE (name + password only; address managed separately)
document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const currentUserInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserInfo) return;

    const users = getUsers();
    const idx   = users.findIndex(u => u.id === currentUserInfo.id);
    if (idx === -1) return;

    const newName = document.getElementById('prof-name').value.trim();
    const newPass = document.getElementById('prof-password').value;

    users[idx].name = newName;
    if (newPass !== '') users[idx].password = newPass;

    localStorage.setItem('users', JSON.stringify(users));
    currentUserInfo.name = newName;
    localStorage.setItem('currentUser', JSON.stringify(currentUserInfo));

    document.getElementById('display-user-name').innerText = newName;
    document.getElementById('prof-password').value         = '';
    updateHeaderGreeting();
    showToast(`<span>Cập nhật thông tin thành công! ✓</span>`, 'success');
});

// RENDER LỊCH SỬ ĐƠN HÀNG
function renderOrdersList(ordersArray) {
    const container = document.getElementById('orders-list-container');
    if (ordersArray.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;background:#f9f9f9;border-radius:8px;">
                <i class="fas fa-box-open" style="font-size:36px;color:#ccc;margin-bottom:12px;display:block;"></i>
                <p>Bạn chưa có đơn hàng nào.</p>
            </div>`;
        return;
    }
    let html = '';
    [...ordersArray].reverse().forEach(order => {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item-mini">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}">
                    <div>
                        <div style="font-weight:700;">${item.name}</div>
                        <div style="color:#666;">Size: ${item.size} | Qty: ${item.quantity}</div>
                    </div>
                </div>`;
        });
        const dateStr     = new Date(order.date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
                <div class="order-items">${itemsHtml}</div>
                <div class="order-total">Total: $${order.totalPrice.toFixed(2)}</div>
            </div>`;
    });
    container.innerHTML = html;
}

/* ============================================================
   8. HEADER GREETING
============================================================ */
function updateHeaderGreeting() {
    const greetingEl = document.getElementById('header-greeting');
    const userIcon   = document.getElementById('header-user-icon');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!greetingEl) return;
    if (currentUser) {
        greetingEl.innerHTML = `Hi, <span style="color:#4f6bf5;cursor:pointer;" onclick="openProfileModal()">${currentUser.name}</span>!`;
        if (userIcon) userIcon.onclick = openProfileModal;
    } else {
        greetingEl.innerHTML = `<a href="#" onclick="openAuthModal('login');return false;" style="text-decoration:none;color:#666;font-size:13px;">Chưa có tài khoản? <span style="color:#4f6bf5;font-weight:700;">Đăng ký ngay!</span></a>`;
        if (userIcon) userIcon.onclick = () => openAuthModal('login');
    }
}

function updateCartPageHeader() {
    const greetingEl  = document.getElementById('cart-page-greeting');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!greetingEl) return;
    if (currentUser) {
        greetingEl.innerHTML = `Hi, <span style="color:#4f6bf5;cursor:pointer;" onclick="openProfileModal()">${currentUser.name}</span>!`;
    } else {
        greetingEl.innerHTML = `<a href="#" onclick="openAuthModal('login');return false;" style="color:#4f6bf5;text-decoration:none;font-size:13px;">Đăng nhập</a>`;
    }
}

/* ============================================================
   9. PRODUCT DETAIL
============================================================ */
function renderProductDetail(product, shouldScroll = false) {
    const container = document.getElementById('product-detail-section');
    if (!container) return;

    let sizesHtml = product.sizes.map(size => {
        let isDisabled = !size.available ? 'disabled' : '';
        let isSelected = (!isDisabled && size.val == product.sizes.find(s=>s.available)?.val) ? 'selected' : '';
        return `<div class="size-btn ${isDisabled} ${isSelected}">${size.val}</div>`;
    }).join('');

    let colorsHtml = product.colors.map((colorObj, i) => {
        return `<div class="color-circle ${i===0?'selected':''}" style="background-color:${colorObj.hex};"></div>`;
    }).join('');

    container.innerHTML = `
    <div class="detail-image">
        <span class="tag-badge">${product.tag}</span>
        <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="detail-info">
        <span style="color:#888;font-size:14px;font-weight:600;text-transform:uppercase;">Men's Shoes</span>
        <h1>${product.name}</h1>
        <span class="price">$${product.price.toFixed(2)}</span>
        <div style="margin-top:20px;">
            <span class="label">Color</span>
            <div class="color-options">${colorsHtml}</div>
        </div>
        <div>
            <div style="display:flex;justify-content:space-between;">
                <span class="label">Select Size</span>
                <span class="label" style="color:var(--primary-blue);cursor:pointer;">Size Chart</span>
            </div>
            <div class="size-grid">${sizesHtml}</div>
        </div>
        <div class="btn-group">
            <button id="btn-add-to-cart" class="btn btn-black">Add To Cart</button>
            <button class="btn btn-fav"><i class="far fa-heart"></i></button>
        </div>
        <button id="btn-buy-now" class="btn btn-blue" style="width:100%">Buy It Now</button>
        <div class="description">
            ${product.description}<br><br>
            This product is excluded from all promotional discounts and offers.
        </div>
    </div>`;

    handleAddToCartLogic(product);

    // Chỉ scroll khi user click, KHÔNG scroll khi init trang (F5)
    if (shouldScroll) {
        window.scrollTo({ behavior: 'smooth', top: container.offsetTop - 20 });
    }
}

/* ============================================================
   10. ADD TO CART LOGIC (Có auth guard + sync)
============================================================ */
function handleAddToCartLogic(product) {
    let selectedSize  = null;
    let selectedColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Standard';

    // Chọn size
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        if (btn.classList.contains('disabled')) return;
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.innerText;
        });
    });

    // Chọn màu
    const colorCircles = document.querySelectorAll('.color-circle');
    colorCircles.forEach((circle, i) => {
        circle.addEventListener('click', function() {
            colorCircles.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = product.colors[i].name;
        });
    });

    function addToCart(isBuyNow) {
        // ✅ KIỂM TRA ĐĂNG NHẬP
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            if (confirm('Bạn cần đăng nhập để thêm vào giỏ hàng.\nNhấn OK để đăng nhập.')) {
                openAuthModal('login');
            }
            return;
        }

        // ✅ KIỂM TRA SIZE
        if (!selectedSize) {
            alert('Vui lòng chọn size trước!');
            return;
        }

        const cartItem = {
            id: product.id, name: product.name, price: product.price,
            image: product.image, size: selectedSize, color: selectedColor, quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const existIdx = cart.findIndex(item =>
            item.id === cartItem.id && item.size === cartItem.size && item.color === cartItem.color
        );
        if (existIdx !== -1) cart[existIdx].quantity += 1;
        else cart.push(cartItem);

        localStorage.setItem('shoppingCart', JSON.stringify(cart));

        // ✅ SYNC VÀO users[].cart
        syncCartToUser();

        updateCartIconCount();
        cartBottom.renderCart();

        if (isBuyNow) {
            showPage('page-cart');
        } else {
            // Show toast instead of opening mini cart panel
            showCartToast(product, selectedSize, selectedColor);
        }
    }

    const btnAdd = document.getElementById('btn-add-to-cart');
    const btnBuy = document.getElementById('btn-buy-now');
    if (btnAdd) btnAdd.onclick = () => addToCart(false);
    if (btnBuy) btnBuy.onclick = () => addToCart(true);
}

/* ============================================================
   11. FILTER & GRID
============================================================ */
let state = {
    filters: { brands: [], sizes: [], colors: [], maxPrice: 1000 },
    currentPage: 1,
    itemsPerPage: 6
};

function toggleFilter(type, value, element) {
    if (type === 'brand') {
        state.filters.brands.includes(value)
            ? state.filters.brands = state.filters.brands.filter(i => i !== value)
            : state.filters.brands.push(value);
    } else if (type === 'size') {
        document.querySelectorAll('.filter-size-btn').forEach(btn => {
            if (parseInt(btn.innerText) === value) btn.classList.toggle('active');
        });
        state.filters.sizes.includes(value)
            ? state.filters.sizes = state.filters.sizes.filter(i => i !== value)
            : state.filters.sizes.push(value);
    } else if (type === 'color') {
        if (element) element.classList.toggle('active');
        state.filters.colors.includes(value)
            ? state.filters.colors = state.filters.colors.filter(i => i !== value)
            : state.filters.colors.push(value);
    }
    state.currentPage = 1;
    renderProductGrid();
}

function updatePrice(value) {
    document.getElementById('priceValue').innerText = `$${value}`;
    state.filters.maxPrice = parseInt(value);
    state.currentPage = 1;
    renderProductGrid();
}

function getFilteredProducts() {
    return products.filter(p => {
        const brandMatch = state.filters.brands.length === 0 || state.filters.brands.includes(p.brand);
        const priceMatch = p.price <= state.filters.maxPrice;
        const sizeMatch  = state.filters.sizes.length === 0 || state.filters.sizes.some(s => p.sizes.map(sz => sz.val).includes(s));
        const colorMatch = state.filters.colors.length === 0 || state.filters.colors.some(c => p.colors.map(co => co.hex).includes(c));
        return brandMatch && priceMatch && sizeMatch && colorMatch;
    });
}

function renderProductGrid() {
    const grid       = document.getElementById('grid-container');
    const pagination = document.getElementById('pagination');
    const countLabel = document.getElementById('product-count');
    if (!grid || !pagination) return;

    grid.innerHTML = '';
    pagination.innerHTML = '';

    const filteredData = getFilteredProducts();
    if (countLabel) countLabel.innerText = `(${filteredData.length} items)`;

    if (filteredData.length === 0) {
        grid.innerHTML = '<div style="width:100%;text-align:center;grid-column:1/-1;padding:40px;">No products found.</div>';
        return;
    }

    const totalPages  = Math.ceil(filteredData.length / state.itemsPerPage);
    const startIndex  = (state.currentPage - 1) * state.itemsPerPage;
    const pageProducts = filteredData.slice(startIndex, startIndex + state.itemsPerPage);

    pageProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick   = () => renderProductDetail(product, true); // scroll khi click
        card.innerHTML = `
            <div class="card-img">
                <span class="card-badge">${product.tag}</span>
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="card-info">
                <div class="card-title">${product.name}</div>
                <div class="card-price">$${product.price.toFixed(2)}</div>
                <button class="btn-view">View Product</button>
            </div>`;
        grid.appendChild(card);
    });

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText  = i;
            btn.className  = `page-btn ${i === state.currentPage ? 'active' : ''}`;
            btn.onclick    = () => {
                state.currentPage = i;
                renderProductGrid();
                document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
            };
            pagination.appendChild(btn);
        }
    }
}

/* ============================================================
   12. NEW DROPS
============================================================ */
function renderNewDrops() {
    const container = document.getElementById('new-drops-grid');
    if (!container) return;
    container.innerHTML = '';

    products.slice(0, 4).forEach(item => {
        const card = document.createElement('div');
        card.className = 'drop-card';
        card.innerHTML = `
            <div class="drop-image-wrap">
                <span class="drop-tag">New</span>
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="drop-title">${item.name}</div>
            <button class="btn-drop-view">VIEW PRODUCT - <span>$${item.price}</span></button>`;

        const goToDetail = () => {
            renderProductDetail(item, true); // scroll khi click
        };
        card.querySelector('.btn-drop-view').addEventListener('click', goToDetail);
        card.querySelector('.drop-image-wrap').addEventListener('click', goToDetail);
        container.appendChild(card);
    });
}

/* ============================================================
   13. CART ICON COUNT
============================================================ */
function updateCartIconCount() {
    const cart  = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const total = cart.reduce((s, item) => s + item.quantity, 0);

    // Badge header
    const elCount = document.getElementById('main-cart-count');
    if (elCount) { elCount.innerText = total; elCount.style.display = total > 0 ? 'inline-block' : 'none'; }

    // Badge floating button
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
}

/* ============================================================
   14. MINI CART (FLOATING PANEL)
============================================================ */
class CartBottom {
    constructor() { this.cartKey = 'shoppingCart'; this.init(); }

    getCartData() {
        try { const c = localStorage.getItem(this.cartKey); return c ? JSON.parse(c) : []; }
        catch(e) { return []; }
    }
    getTotalPrice() { return this.getCartData().reduce((s,i) => s + parseFloat(i.price) * (i.quantity||1), 0); }
    getTotalItems() { return this.getCartData().reduce((s,i) => s + (i.quantity||1), 0); }

    toggleCart() {
        const p = document.getElementById('cartPanel');
        if (p) { p.classList.toggle('show'); if (p.classList.contains('show')) this.renderCart(); }
    }
    hideCart() {
        const p = document.getElementById('cartPanel');
        if (p) p.classList.remove('show');
    }

    renderCart() {
        const container = document.getElementById('cartItemsList');
        const totalEl   = document.getElementById('cartTotal');
        const badge     = document.getElementById('cartBadge');
        const cartData  = this.getCartData();
        const totalItems = this.getTotalItems();

        if (badge) { badge.textContent = totalItems; badge.style.display = totalItems > 0 ? 'flex' : 'none'; }
        if (!container) return;

        if (cartData.length === 0) {
            container.innerHTML = '<div class="empty-cart"><p>Giỏ hàng trống</p></div>';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        container.innerHTML = cartData.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name || 'Sản phẩm'}</h4>
                    <div class="price">$${parseFloat(item.price).toFixed(2)}</div>
                </div>
                <span class="cart-item-quantity">x${item.quantity || 1}</span>
            </div>`).join('');

        if (totalEl) totalEl.textContent = `$${this.getTotalPrice().toFixed(2)}`;
    }

    init() {
        window.addEventListener('storage', e => { if (e.key === this.cartKey) this.renderCart(); });
        document.addEventListener('click', e => {
            const p = document.getElementById('cartPanel');
            const t = document.querySelector('.cart-toggle-btn');
            if (p && p.classList.contains('show') && !p.contains(e.target) && t && !t.contains(e.target)) {
                this.hideCart();
            }
        });
    }
}

const cartBottom = new CartBottom();
function toggleCart() { cartBottom.toggleCart(); }

/* ============================================================
   15. CART PAGE LOGIC
============================================================ */
function renderCart() {
    const cart      = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const container = document.querySelector('.cart-items-container');
    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h3>Your bag is empty</h3>
                <a href="#" onclick="showPage('page-index');return false;"
                   style="color:#4f6bf5;text-decoration:underline;font-weight:bold;">Go Shopping</a>
            </div>`;
        return;
    }

    cart.forEach((item, index) => {
        const imgSrc = item.image || 'https://via.placeholder.com/150';
        container.innerHTML += `
        <div class="cart-item-full">
            <div class="cart-item-img"><img src="${imgSrc}" alt="${item.name}"></div>
            <div class="cart-item-info-full">
                <div class="item-top-row">
                    <span class="item-title">${item.name}</span>
                    <span class="item-price">$${item.price.toFixed(2)}</span>
                </div>
                <span class="item-subtitle">Size: ${item.size}</span>
                <span class="item-subtitle">Color: ${item.color || 'Standard'}</span>
                <div class="item-controls">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <label>Qty:</label>
                        <select class="cart-select" onchange="updateQuantity(${index}, this.value)">
                            ${renderQtyOptions(item.quantity)}
                        </select>
                    </div>
                </div>
                <div class="item-actions-full">
                    <i class="fa-regular fa-trash-can action-icon" onclick="removeItem(${index})" title="Remove"></i>
                </div>
            </div>
        </div>`;
    });
}

function renderQtyOptions(selected) {
    let opts = '';
    for (let i = 1; i <= 10; i++) opts += `<option value="${i}" ${i == selected ? 'selected' : ''}>${i}</option>`;
    return opts;
}

function updateQuantity(index, newQty) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart[index].quantity = parseInt(newQty);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    syncCartToUser(); // ✅ sync
    renderCart();
    updateCartSummary();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    syncCartToUser(); // ✅ sync
    renderCart();
    updateCartSummary();
}

function updateCartSummary() {
    const cart       = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((s,i) => s + i.quantity, 0);
    const subtotal   = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    const shipping   = cart.length > 0 ? 6.99 : 0;
    const total      = subtotal + shipping;

    const elItems    = document.getElementById('summary-total-items');
    const elPrice    = document.getElementById('summary-total-price');
    const elTotal    = document.getElementById('summary-final-total');
    const elCount    = document.getElementById('cart-page-count');

    if (elItems) elItems.innerText = `${totalItems} ITEMS`;
    if (elPrice) elPrice.innerText = `$${subtotal.toFixed(2)}`;
    if (elTotal) elTotal.innerText = `$${total.toFixed(2)}`;
    if (elCount) elCount.innerText = totalItems;
}

/* ============================================================
   16. CHECKOUT SLIDE
============================================================ */
let checkoutSelectedAddressIndex = -1; // -1 = using new address form

function openCheckoutSlide() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cart.length === 0) { alert('Giỏ hàng trống!'); return; }

    renderCheckoutMiniItems(cart);
    renderCheckoutAddressSection();

    document.getElementById('checkout-panel').classList.add('active');
    document.body.style.overflow = 'hidden';

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const emailField = document.getElementById('checkout-email');
        if (emailField) emailField.value = currentUser.email || '';
    }
}

function renderCheckoutAddressSection() {
    const container = document.getElementById('checkout-address-section');
    if (!container) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { container.innerHTML = ''; return; }

    const users    = getUsers();
    const userObj  = users.find(u => u.id === currentUser.id);
    const addresses = userObj?.address || [];

    // Find default or use first
    const defaultIdx = addresses.findIndex(a => a.isDefault);
    checkoutSelectedAddressIndex = defaultIdx !== -1 ? defaultIdx : (addresses.length > 0 ? 0 : -1);

    if (addresses.length === 0) {
        // No address → show form directly
        container.innerHTML = buildNewAddressForm(true);
        return;
    }

    // Has addresses → show ol list + "New address?" button
    const items = addresses.map((addr, i) => `
        <li id="co-addr-item-${i}" onclick="selectCheckoutAddress(${i})"
            style="padding:12px 16px;border:2px solid ${i === checkoutSelectedAddressIndex ? '#4f6bf5' : '#e0e0e0'};
                   border-radius:10px;margin-bottom:8px;cursor:pointer;
                   background:${i === checkoutSelectedAddressIndex ? '#f0f4ff' : '#fff'};
                   transition:all 0.2s;display:flex;align-items:flex-start;gap:10px;">
            <span style="margin-top:2px;font-size:18px;">${i === checkoutSelectedAddressIndex ? '🔵' : '⚪'}</span>
            <div>
                <div style="font-weight:700;font-size:12px;color:#888;text-transform:uppercase;margin-bottom:3px;">
                    ${addr.type}${addr.isDefault ? ' <span style="background:#4f6bf5;color:#fff;padding:1px 7px;border-radius:20px;font-size:11px;margin-left:4px;">Default</span>' : ''}
                </div>
                <div style="font-size:14px;color:#222;">${addr.content}</div>
            </div>
        </li>`).join('');

    container.innerHTML = `
        <h4 style="font-weight:700;margin-bottom:12px;">Shipping Address</h4>
        <ol style="list-style:none;padding:0;margin-bottom:10px;">${items}</ol>
        <button type="button" onclick="toggleCheckoutNewAddrForm()"
            id="btn-co-new-addr"
            style="background:none;border:2px dashed #ccc;border-radius:10px;width:100%;
                   padding:10px;color:#888;font-weight:600;font-size:13px;cursor:pointer;margin-bottom:4px;">
            + New address?
        </button>
        <div id="co-new-addr-form" style="display:none;margin-top:8px;">
            ${buildNewAddressForm(false)}
        </div>`;
}

function buildNewAddressForm(standalone) {
    return `
        <div style="${standalone ? '' : ''}">
            ${standalone ? '<h4 style="font-weight:700;margin-bottom:12px;">Add a Shipping Address</h4>' : ''}
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <input id="co-new-addr-type" type="text" placeholder="Type (e.g. Home)"
                    style="flex:1;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                <input id="co-new-addr-content" type="text" placeholder="Full delivery address*"
                    style="flex:2;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <button type="button" onclick="saveAndUseNewCheckoutAddress()"
                style="background:#222;color:#fff;border:none;padding:10px 20px;
                       border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;width:100%;">
                Use this address & Save
            </button>
        </div>`;
}

function selectCheckoutAddress(index) {
    checkoutSelectedAddressIndex = index;
    // Re-render address list to update highlight
    renderCheckoutAddressSection();
    // Hide new-addr form if it was open
    const form = document.getElementById('co-new-addr-form');
    if (form) form.style.display = 'none';
}

function toggleCheckoutNewAddrForm() {
    const form = document.getElementById('co-new-addr-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveAndUseNewCheckoutAddress() {
    const typeInput    = document.getElementById('co-new-addr-type');
    const contentInput = document.getElementById('co-new-addr-content');
    const type    = typeInput?.value.trim() || 'Home';
    const content = contentInput?.value.trim();
    if (!content) { showToast('<span>Please enter a delivery address!</span>', 'error'); return; }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === currentUser.id);
    if (idx === -1) return;

    if (!Array.isArray(users[idx].address)) users[idx].address = [];

    // Set all existing as non-default, new one as default
    users[idx].address.forEach(a => a.isDefault = false);
    const newAddr = { id: 'addr_' + Date.now(), type, content, isDefault: true };
    users[idx].address.push(newAddr);
    localStorage.setItem('users', JSON.stringify(users));

    checkoutSelectedAddressIndex = users[idx].address.length - 1;
    showToast('<span>Address saved & selected! ✓</span>', 'success');
    renderCheckoutAddressSection();
}

function closeCheckout() {
    document.getElementById('checkout-panel').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderCheckoutMiniItems(cart) {
    const container = document.getElementById('checkout-items-list');
    if (!container) return;
    let subtotal = 0, html = '';

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const imgSrc = item.image || 'https://via.placeholder.com/150';
        html += `
            <div class="co-item">
                <div class="co-img"><img src="${imgSrc}" alt="${item.name}"></div>
                <div class="co-info">
                    <div class="co-name">${item.name}</div>
                    <span class="co-sub">Size: ${item.size} | Qty: ${item.quantity}</span>
                    <span class="co-price">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    const shipping = 6.00;
    document.getElementById('co-total-items').innerText  = `${cart.length} ITEMS`;
    document.getElementById('co-subtotal').innerText     = `$${subtotal.toFixed(2)}`;
    document.getElementById('co-final-total').innerText  = `$${(subtotal + shipping).toFixed(2)}`;
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function processPayment() {
    // ✅ KIỂM TRA ĐĂNG NHẬP
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Bạn cần đăng nhập trước khi thanh toán!');
        closeCheckout();
        openAuthModal('login');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cart.length === 0) { alert('Giỏ hàng trống!'); return; }

    // ✅ RESOLVE SHIPPING ADDRESS
    const users   = getUsers();
    const userIdx = users.findIndex(u => u.id === currentUser.id);
    const addresses = userIdx !== -1 ? (users[userIdx].address || []) : [];

    let shippingAddress = '';
    if (checkoutSelectedAddressIndex >= 0 && addresses[checkoutSelectedAddressIndex]) {
        shippingAddress = addresses[checkoutSelectedAddressIndex].content;
        // Make selected address the new default
        addresses.forEach((a, i) => a.isDefault = (i === checkoutSelectedAddressIndex));
        if (userIdx !== -1) {
            users[userIdx].address = addresses;
        }
    } else {
        // Fallback: try new address form
        const newContent = document.getElementById('co-new-addr-content')?.value.trim();
        if (!newContent) {
            showToast('<span>Please select or add a delivery address!</span>', 'error', 3500);
            return;
        }
        const newType = document.getElementById('co-new-addr-type')?.value.trim() || 'Home';
        // Save and set as default
        addresses.forEach(a => a.isDefault = false);
        const saved = { id: 'addr_' + Date.now(), type: newType, content: newContent, isDefault: true };
        addresses.push(saved);
        shippingAddress = newContent;
        if (userIdx !== -1) users[userIdx].address = addresses;
    }

    const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    const total    = subtotal + 6.00;

    const newOrder = {
        orderId:         generateOrderId(),
        userId:          currentUser.id,
        customerName:    currentUser.name,
        email:           document.getElementById('checkout-email')?.value || currentUser.email || 'No Email',
        date:            new Date().toISOString(),
        items:           cart,
        totalPrice:      total,
        status:          'Pending',
        shippingAddress
    };

    // Lưu vào allOrders (Admin dùng)
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

    // Lưu order vào users[] + xóa cart + cập nhật address default
    if (userIdx !== -1) {
        if (!users[userIdx].orders) users[userIdx].orders = [];
        users[userIdx].orders.push(newOrder);
        users[userIdx].cart = [];
        localStorage.setItem('users', JSON.stringify(users));
    }

    localStorage.removeItem('shoppingCart');

    closeCheckout();
    renderCart();
    updateCartSummary();
    cartBottom.renderCart();
    updateCartIconCount();

    showToast(`
        <div class="kicks-toast-body">
            <span class="kicks-toast-title">🎉 Payment Successful!</span>
            <span class="kicks-toast-msg">${newOrder.orderId}</span>
            <span style="font-size:12px;opacity:0.65;font-weight:500;">Total: $${total.toFixed(2)}</span>
        </div>
    `, 'success', 5000);
}

/* ============================================================
   17. MODAL: ESC + CLICK-OUTSIDE
============================================================ */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeProfileModal();
        closeAuthModal();
        closeCheckout();
    }
});
document.getElementById('profile-modal').addEventListener('click', function(e) {
    if (e.target === this) closeProfileModal();
});
document.getElementById('auth-modal').addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
});

/* ============================================================
   18. INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromUser();      // Load cart của user đang đăng nhập
    updateHeaderGreeting();
    updateCartIconCount();
    cartBottom.renderCart();
    renderProductGrid();     // Render grid sản phẩm
    renderNewDrops();        // Render new drops
    // Không gọi renderProductDetail ở đây → tránh scroll khi F5
});