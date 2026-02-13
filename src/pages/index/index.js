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

    // Xử lý logic thêm vào giỏ hàng
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
        const productColors = product.colors.map(c => c.hex);
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
        renderNewDrops();
    }
});

/* ==========================================================
   PHẦN LOGIC MỚI: XỬ LÝ GIỎ HÀNG & NÚT MUA HÀNG
   ========================================================== */
function handleAddToCartLogic(product) {
    let selectedSize = null;

    // 1. Logic chọn Size
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        if (btn.classList.contains('disabled')) return; 

        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.innerText; 
        });
    });

    // 2. Hàm xử lý chung cho Add Cart và Buy Now
    function addToCart(isBuyNow = false) {
        if (!selectedSize) {
            alert("Please select a size first!");
            return;
        }

        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            color: product.colors && product.colors.length > 0 ? product.colors[0].name : "Standard", 
            quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartIconCount();

        if (isBuyNow) {
            window.location.href = '../cart/cart.html';
        } else {
            alert("Added to cart successfully!");
        }
    }

    const btnAdd = document.getElementById('btn-add-to-cart');
    const btnBuy = document.getElementById('btn-buy-now');

    if(btnAdd) btnAdd.addEventListener('click', () => addToCart(false));
    if(btnBuy) btnBuy.addEventListener('click', () => addToCart(true));
}

// Hàm cập nhật số lượng trên icon giỏ hàng (Header)
function updateCartIconCount() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElement = document.querySelector('.cart-count');
    if (countElement) {
        countElement.innerText = totalItems;
        countElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Dữ liệu mẫu cho phần New Drops (4 sản phẩm mới nhất)
const newDropsData = typeof products !== 'undefined' ? products.slice(0, 4) : [];

// Hàm Render New Drops
function renderNewDrops() {
    const container = document.getElementById('new-drops-grid');
    if (!container) return;

    container.innerHTML = '';
    
    newDropsData.forEach(item => {
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

        const btnView = card.querySelector('.btn-drop-view');
        btnView.addEventListener('click', () => {
            renderProductDetail(item);
            const detailSection = document.getElementById('product-detail-section');
            if(detailSection) detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        const imgWrap = card.querySelector('.drop-image-wrap');
        imgWrap.addEventListener('click', () => {
            renderProductDetail(item);
            const detailSection = document.getElementById('product-detail-section');
            if(detailSection) detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        container.appendChild(card);
    });
}
/* GIỎ HÀNG Ở INDEX */
class CartBottom {
    constructor() {
        this.cartKey = 'shoppingCart';
        this.init();
    }

    getCartData() {
        try {
            const cart = localStorage.getItem(this.cartKey);
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            return [];
        }
    }

    getTotalPrice() {
        const cart = this.getCartData();
        return cart.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * (item.quantity || 1));
        }, 0);
    }

    getTotalItems() {
        const cart = this.getCartData();
        return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    toggleCart() {
        const cartPanel = document.getElementById('cartPanel');
        if (cartPanel) {
            cartPanel.classList.toggle('show');
            if (cartPanel.classList.contains('show')) {
                this.renderCart();
            }
        }
    }

    hideCart() {
        const cartPanel = document.getElementById('cartPanel');
        if (cartPanel) {
            cartPanel.classList.remove('show');
        }
    }

    renderCart() {
        const cartContainer = document.getElementById('cartItemsList');
        const totalElement = document.getElementById('cartTotal');
        const badge = document.getElementById('cartBadge');
        const cartData = this.getCartData();
        const totalItems = this.getTotalItems();

        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (!cartContainer) return;

        if (cartData.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Giỏ hàng trống</p>
                </div>
            `;
            if (totalElement) totalElement.textContent = '$0.00';
            return;
        }

        cartContainer.innerHTML = cartData.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name || 'Sản phẩm'}</h4>
                    <div class="price">$${parseFloat(item.price).toFixed(2)}</div>
                </div>
                <span class="cart-item-quantity">x${item.quantity || 1}</span>
            </div>
        `).join('');

        if (totalElement) {
            totalElement.textContent = `$${this.getTotalPrice().toFixed(2)}`;
        }
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderCart();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === this.cartKey) {
                this.renderCart();
            }
        });

        document.addEventListener('click', (e) => {
            const cartPanel = document.getElementById('cartPanel');
            const toggleBtn = document.querySelector('.cart-toggle-btn');
            
            if (cartPanel && cartPanel.classList.contains('show')) {
                if (!cartPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
                    this.hideCart();
                }
            }
        });
    }
}

const cartBottom = new CartBottom();

function toggleCart() {
    cartBottom.toggleCart();
}