/* index.js - Đã cập nhật Logic Lọc Màu */
// --- LẤY DỮ LIỆU SẢN PHẨM TỪ LOCAL STORAGE ---
if (!localStorage.getItem('products')) {
const products = JSON.parse(localStorage.getItem('products')) || [];
}
// --- 1. KHAI BÁO BIẾN TRẠNG THÁI ---
let state = {
    filters: {
        brands: [],
        sizes: [],
        colors: [], // Mảng chứa các mã màu đang chọn
        maxPrice: 1000
    },
    currentPage: 1,
    itemsPerPage: 6
};

// --- 2. RENDER CHI TIẾT SẢN PHẨM ---
function renderProductDetail(product) {
    const container = document.getElementById('product-detail-section');
    
    let sizesHtml = product.sizes.map(size => {
        let isDisabled = !size.available ? 'disabled' : ''; 
        let isSelected = !isDisabled && size.val == product.sizes[0].val ? 'selected' : ''; 
        return `<div class="size-btn ${isDisabled} ${isSelected}">${size.val}</div>`;
    }).join('');

    let colorsHtml = product.colors.map((colorObj, index) => {
        let isSelected = index === 0 ? 'selected' : '';
        return `<div class="color-circle ${isSelected}" style="background-color: ${colorObj.hex};"></div>`;
    }).join('');

  // ... (Code render colorsHtml và sizesHtml ở trên) ...

container.innerHTML = `
    <div class="detail-image">
        <span class="tag-badge">${product.tag}</span>
        <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="detail-info">
        <span style="color: #888; font-size: 14px; font-weight: 600; text-transform: uppercase;">Men's Shoes</span>
        <h1>${product.name}</h1>
        <span class="price">$${product.price.toFixed(2)}</span>
        
        <div style="margin-top: 20px;">
            <span class="label">Color</span>
            <div class="color-options">${colorsHtml}</div>
        </div>
        
        <div>
            <div style="display:flex; justify-content:space-between;">
                <span class="label">Select Size</span>
                <span class="label" style="color:var(--primary-blue); cursor:pointer;">Size Chart</span>
            </div>
            <div class="size-grid">${sizesHtml}</div>
        </div>

      <div class="btn-group">
    <button id="btn-add-to-cart" class="btn btn-black">Add To Cart</button>
    <button class="btn btn-fav"><i class="far fa-heart"></i></button>
</div>
<button id="btn-buy-now" class="btn btn-blue" style="width:100%">Buy It Now</button>
        
        <div class="description">
            ${product.description} <br><br>
            This product is excluded from all promotional discounts and offers.
        </div>
    </div>
`;

// --- PHẦN LOGIC QUAN TRỌNG CẦN THÊM NGAY SAU KHI GÁN INNERHTML ---
handleAddToCartLogic(product);
    
    if(container) window.scrollTo({ behavior: 'smooth', top: container.offsetTop - 20 });
}

// --- 3. XỬ LÝ SỰ KIỆN FILTER (CORE) ---

function toggleFilter(type, value, element) {
    // A. Logic BRAND (Checkbox)
    if (type === 'brand') {
        if (state.filters.brands.includes(value)) {
            state.filters.brands = state.filters.brands.filter(item => item !== value);
        } else {
            state.filters.brands.push(value);
        }
    } 
    // B. Logic SIZE (Button)
    else if (type === 'size') {
        // Toggle class active cho nút bấm (Visual)
        const btns = document.querySelectorAll('.filter-size-btn');
        btns.forEach(btn => {
            if(parseInt(btn.innerText) === value) btn.classList.toggle('active');
        });

        // Update dữ liệu
        if (state.filters.sizes.includes(value)) {
            state.filters.sizes = state.filters.sizes.filter(item => item !== value);
        } else {
            state.filters.sizes.push(value);
        }
    }
    // C. Logic COLOR (Button tròn) - MỚI THÊM
    else if (type === 'color') {
        // Toggle visual active (thêm viền đen)
        if (element) element.classList.toggle('active');

        if (state.filters.colors.includes(value)) {
            state.filters.colors = state.filters.colors.filter(item => item !== value);
        } else {
            state.filters.colors.push(value);
        }
    }
    
    // Reset về trang 1 và render lại lưới sản phẩm
    state.currentPage = 1;
    renderProductGrid();
}

// Xử lý thanh giá
function updatePrice(value) {
    document.getElementById('priceValue').innerText = `$${value}`;
    state.filters.maxPrice = parseInt(value);
    state.currentPage = 1;
    renderProductGrid();
}

// Reset toàn bộ
function resetFilters() {
    state.filters = { brands: [], sizes: [], colors: [], maxPrice: 1000 };
    state.currentPage = 1;
    
    // Reset UI HTML
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-size-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.filter-color-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('priceRange').value = 1000;
    document.getElementById('priceValue').innerText = "$1000";
    
    renderProductGrid();
}

// --- 4. LOGIC LỌC DỮ LIỆU ---
function getFilteredProducts() {
    return products.filter(product => {
        // 1. Lọc Brand
        const brandMatch = state.filters.brands.length === 0 || state.filters.brands.includes(product.brand);
        
        // 2. Lọc Giá
        const priceMatch = product.price <= state.filters.maxPrice;
        
        // 3. Lọc Size
        const productSizeValues = product.sizes.map(s => s.val); 
        const sizeMatch = state.filters.sizes.length === 0 || state.filters.sizes.some(s => productSizeValues.includes(s));

        // 4. Lọc Màu (Mới)
        // Lấy danh sách mã màu của giày hiện tại
        const productColors = product.colors.map(c => c.hex);
        // Kiểm tra xem giày có chứa màu đang chọn không
        const colorMatch = state.filters.colors.length === 0 || state.filters.colors.some(c => productColors.includes(c));

        return brandMatch && priceMatch && sizeMatch && colorMatch;
    });
}

// --- 5. RENDER GRID & PHÂN TRANG ---
function renderProductGrid() {
    const grid = document.getElementById('grid-container');
    const pagination = document.getElementById('pagination');
    const countLabel = document.getElementById('product-count');
    
    if (!grid || !pagination) return;

    grid.innerHTML = '';
    pagination.innerHTML = '';

    const filteredData = getFilteredProducts();
    if(countLabel) countLabel.innerText = `(${filteredData.length} items)`;

    if (filteredData.length === 0) {
        grid.innerHTML = '<div style="width:100%; text-align:center; grid-column: 1/-1;">No products found.</div>';
        return;
    }

    const totalPages = Math.ceil(filteredData.length / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const productsOnPage = filteredData.slice(startIndex, startIndex + state.itemsPerPage);

    productsOnPage.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => renderProductDetail(product);

        card.innerHTML = `
            <div class="card-img">
                <span class="card-badge">${product.tag}</span>
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="card-info">
                <div class="card-title">${product.name}</div>
                <div class="card-price">$${product.price.toFixed(2)}</div>
                <button class="btn-view">View Product</button>
            </div>
        `;
        grid.appendChild(card);
    });

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.className = `page-btn ${i === state.currentPage ? 'active' : ''}`;
            btn.onclick = () => {
                state.currentPage = i;
                renderProductGrid();
                document.querySelector('.main-content').scrollIntoView({behavior: 'smooth'});
            };
            pagination.appendChild(btn);
        }
    }
}

// --- 6. KHỞI TẠO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cập nhật số trên giỏ hàng ngay khi vào web
    updateCartIconCount();

    // 2. Render dữ liệu
    if (typeof products !== 'undefined' && products.length > 0) {
        renderProductDetail(products[0]);
        renderProductGrid();
    }
});

/* ==========================================================
   PHẦN LOGIC MỚI: XỬ LÝ GIỎ HÀNG & NÚT MUA HÀNG
   (Dán đoạn này vào cuối file index.js)
   ========================================================== */

function handleAddToCartLogic(product) {
    let selectedSize = null; // Biến lưu size người dùng chọn

    // 1. Logic chọn Size (Click vào ô size nào thì ô đó sáng lên)
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        // Bỏ qua nếu size bị disabled (hết hàng)
        if (btn.classList.contains('disabled')) return; 

        btn.addEventListener('click', function() {
            // Xóa class 'selected' ở tất cả các nút khác
            sizeBtns.forEach(b => b.classList.remove('selected'));
            // Thêm class 'selected' vào nút vừa bấm
            this.classList.add('selected');
            // Lưu giá trị size
            selectedSize = this.innerText; 
        });
    });

    // 2. Hàm xử lý chung cho Add Cart và Buy Now
    function addToCart(isBuyNow = false) {
        // Validate: Bắt buộc chọn size
        if (!selectedSize) {
            alert("Please select a size first!");
            return;
        }

        // Tạo object sản phẩm để lưu
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            // Lấy màu đầu tiên làm mặc định hoặc logic chọn màu nếu cần
            color: product.colors && product.colors.length > 0 ? product.colors[0].name : "Standard", 
            quantity: 1
        };

        // Lấy giỏ hàng từ LocalStorage
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        // Kiểm tra trùng lặp (Cùng ID và Size -> Tăng số lượng)
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(cartItem);
        }

        // Lưu lại vào LocalStorage
        localStorage.setItem('shoppingCart', JSON.stringify(cart));

        // Cập nhật số trên icon giỏ hàng ngay lập tức
        updateCartIconCount();

        // Điều hướng
        if (isBuyNow) {
            window.location.href = '../cart/cart.html'; // Chuyển sang trang Cart
        } else {
            alert("Added to cart successfully!");
        }
    }

    // 3. Bắt sự kiện click cho 2 nút
    const btnAdd = document.getElementById('btn-add-to-cart');
    const btnBuy = document.getElementById('btn-buy-now');

    if(btnAdd) btnAdd.addEventListener('click', () => addToCart(false));
    if(btnBuy) btnBuy.addEventListener('click', () => addToCart(true));
}

// Hàm cập nhật số lượng trên icon giỏ hàng (Header)
function updateCartIconCount() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Tìm phần tử hiển thị số (class .cart-count trong header HTML)
    const countElement = document.querySelector('.cart-count');
    if (countElement) {
        countElement.innerText = totalItems;
        countElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}
// Dữ liệu mẫu cho phần New Drops (4 sản phẩm mới nhất)


// Hàm Render
const newDropsData = products.slice(0, 4);
function renderNewDrops() {
    const container = document.getElementById('new-drops-grid');
    if (!container) return;

    let html = '';
    
    newDropsData.forEach(item => {
        // Tạo thẻ div tạm để gán sự kiện click dễ dàng hơn
        const card = document.createElement('div');
        card.className = 'drop-card';
        
        card.innerHTML = `
            <div class="drop-image-wrap">
                <span class="drop-tag">New</span>
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="drop-title">${item.name}</div>
            <button class="btn-drop-view">
                VIEW PRODUCT - <span>$${item.price}</span>
            </button>
        `;

        // GẮN SỰ KIỆN CLICK: Khi bấm vào nút "VIEW PRODUCT"
        const btnView = card.querySelector('.btn-drop-view');
        btnView.addEventListener('click', () => {
            // 1. Gọi hàm render chi tiết sản phẩm (Hàm này đã có sẵn trong index.js của bạn)
            renderProductDetail(item);
            
            // 2. Cuộn màn hình lên vị trí khung chi tiết để người dùng thấy ngay
            const detailSection = document.getElementById('product-detail-section');
            if(detailSection) {
                detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Gắn sự kiện click cho cả cái ảnh (cho tiện)
        const imgWrap = card.querySelector('.drop-image-wrap');
        imgWrap.addEventListener('click', () => {
            renderProductDetail(item);
            const detailSection = document.getElementById('product-detail-section');
            if(detailSection) detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // Thêm card vào container (Không dùng innerHTML += để giữ được event listener)
        container.appendChild(card);
    });
}

// Gọi hàm khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // ... các hàm khởi tạo khác ...
    renderNewDrops();
});

// Side Panel
/* --- LOGIC SIDE CART DRAWER --- */

// 1. Hàm mở Drawer & Render dữ liệu
function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    
    // Thêm class để kích hoạt CSS trượt
    drawer.classList.add('open');
    overlay.classList.add('open');
    
    // Render dữ liệu mới nhất từ LocalStorage
    renderDrawerItems();
}

// 2. Hàm đóng Drawer
function closeCartDrawer() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

// 3. Hàm Render sản phẩm (Giống mini cart)
function renderDrawerItems() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const container = document.getElementById('drawer-items');
    const countEl = document.getElementById('drawer-count');
    const totalEl = document.getElementById('drawer-total');

    // Cập nhật số lượng trên header
    if(countEl) countEl.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Tính tổng tiền
    let subtotal = 0;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:50px;">Your bag is empty.</p>';
        if(totalEl) totalEl.innerText = "$0.00";
        return;
    }

    let html = '';
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const imgSrc = item.image ? item.image : 'https://via.placeholder.com/150';
        
        html += `
        <div class="drawer-item">
            <div class="d-item-img">
                <img src="${imgSrc}" alt="${item.name}">
            </div>
            <div class="d-item-info">
                <div class="d-item-name">${item.name}</div>
                <span class="d-item-meta">Size: ${item.size} | Qty: ${item.quantity}</span>
                <span class="d-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="d-item-remove" style="cursor:pointer;" onclick="removeDrawerItem(${item.id}, '${item.size}')">
                <i class="far fa-trash-alt" style="color:#999; font-size:14px;"></i>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
    if(totalEl) totalEl.innerText = `$${subtotal.toFixed(2)}`;
}

// 4. Hàm xóa item trực tiếp từ Drawer
function removeDrawerItem(id, size) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // Lọc bỏ sản phẩm có id và size tương ứng
    // Lưu ý: Logic tìm index chính xác hơn splice nếu có id trùng
    const index = cart.findIndex(item => item.id === id && item.size == size);
    if(index !== -1) {
        cart.splice(index, 1);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        
        // Render lại drawer và cập nhật số lượng icon giỏ hàng
        renderDrawerItems();
        updateCartIconCount(); // Hàm này bạn đã có trong index.js cũ
    }
}