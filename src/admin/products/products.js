import products from "../../globals/initilization.js"


const categoryList = [
  { label: "Sneakers", key: "Sneaker" },
  { label: "Runners", key: "Running" },
  { label: "Golf", key: "Golf" },
  { label: "Hiking", key: "Hiking" },
  { label: "Football", key: "Football" },
  { label: "Baseball", key: "Baseball" }
];

// Track selected categories
const selectedCategories = new Map();
const categoryButtons = new Map();
categoryList.forEach(cat => selectedCategories.set(cat, false));

// Grid system (what’s currently displayed)
let gridSystem = [];
let pageIndex = 1;
const itemsPerPage = 9;

// -----------------------------
// Item
// -----------------------------

// Create a product item object
function createItem(name, category, description, image, price, amount) {
  return {
    name: name || "Unnamed Product",
    category: category || "Uncategorized",
    description: description || "No description available.",
    image: image || "https://via.placeholder.com/60",
    price: price || "$0.00",
    amount: amount || 0
  };
}

// Render a single product card
function renderItem(item) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-header">
      <img src="${item.image}" alt="${item.name}" />
      <div class="info">
        <h3>${item.name}</h3>
        <div class="category">${item.brand}</div>
        <div class="price">$${item.price.toFixed(2)}</div>
      </div>
    </div>
    <div class="product-description">${item.description}</div>
    <div class="product-stats">
      <div>Tag: ${item.tag}</div>
      <div>Colors: ${item.colors.map(c => c.name).join(", ")}</div>
      <div>Sizes: ${item.sizes.map(s => s.val).join(", ")}</div>
    </div>
  `;
  return card;
}

// -----------------------------
// Grid
// -----------------------------

// Add item to grid
function addToGrid(item) {
    refreshCategoryCounts();
    gridSystem.push(item);
}

// Remove item from grid by index
function removeFromGrid(index) {
    if (index >= 0 && index < gridSystem.length) {
        gridSystem.splice(index, 1);
        refreshCategoryCounts();
    }
}

// Filter items based on categories
function filterItems() {
  const activeCategories = Array.from(selectedCategories.entries())
    .filter(([_, isSelected]) => isSelected)
    .map(([cat]) => cat);

  let filtered;

  if (activeCategories.length === 0) {
    filtered = products;
  } else {
    filtered = products.filter(item => activeCategories.includes(item.brand));
  }

  gridSystem = filtered.slice((pageIndex - 1) * itemsPerPage, pageIndex * itemsPerPage);
  renderGrid();

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  renderPaginationBar(totalPages);
}

function renderGrid() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    gridSystem.forEach(item => {
        grid.appendChild(renderItem(item));  // <-- this is where items are rendered
    });
}

// Go to a specific page
function goToPage(page) {
  const totalPages = Math.ceil(products.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  pageIndex = page;

  const start = (pageIndex - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  gridSystem = products.slice(start, end);

  renderGrid();
  renderPaginationBar(totalPages);
}

// Render pagination bar
function renderPaginationBar(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Previous button
    if (pageIndex > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.className = "page-btn";
        prevBtn.textContent = "Previous";
        prevBtn.addEventListener("click", () => goToPage(pageIndex - 1));
        pagination.appendChild(prevBtn);
    }

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        if (i === pageIndex) btn.classList.add("active");
        btn.textContent = i;
        btn.addEventListener("click", () => goToPage(i));
        pagination.appendChild(btn);
    }

    // Next button
    if (pageIndex < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.className = "page-btn";
        nextBtn.textContent = "Next";
        nextBtn.addEventListener("click", () => goToPage(pageIndex + 1));
        pagination.appendChild(nextBtn);
    }
}

// -----------------------------
// Category on sidebar
// -----------------------------

function updateCategoryCounts(items) {
  categoryList.forEach(({ key }) => {
    const btn = document.querySelector(`.category-count[data-cat="${key}"]`);
    if (btn) btn.textContent = "0";
  });

  items.forEach(item => {
    const btn = document.querySelector(`.category-count[data-cat="${item.brand}"]`);
    if (btn) {
      const currentCount = parseInt(btn.textContent, 10) || 0;
      btn.textContent = currentCount + 1;
    }
  });
}

function refreshCategoryCounts() {
  updateCategoryCounts(products);
}

function createCategoryButton({ label, key }) {
    const container = document.createElement("div");
    container.className = "category-button";
    container.setAttribute("data-cat", key);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = label;

    const countBtn = document.createElement("button");
    countBtn.className = "category-count";
    countBtn.textContent = "0";
    countBtn.setAttribute("data-cat", key);

    // Entire container is clickable
    container.addEventListener("click", () => {
        const current = selectedCategories.get(key);
        selectedCategories.set(key, !current);

        // Remove all highlights
        document.querySelectorAll(".category-count").forEach(btn => {
        btn.classList.remove("active");
        });

        // Highlight selected ones
        selectedCategories.forEach((isSelected, cat) => {
        const btn = document.querySelector(`.category-count[data-cat="${cat}"]`);
        if (btn && isSelected) {
            btn.classList.add("active");
        }
        });

        // Filter and update pagination
        filterItems();
    });

    container.appendChild(nameSpan);
    container.appendChild(countBtn);
    return container;
}

function renderCategoryBar() {
    const sidebar = document.querySelector(".sidebar");
    const section = document.createElement("div");
    section.className = "category-section";

    const title = document.createElement("h2");
    title.textContent = "Categories";
    section.appendChild(title);

    categoryList.forEach(cat => {
        section.appendChild(createCategoryButton(cat));
    });

    sidebar.appendChild(section);

    // Update counts after buttons are created
    updateCategoryCounts(products);
}


// -----------------------------
// Initialize
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryBar();
  refreshCategoryCounts();
  filterItems(); // ensures all items are shown by default
  renderPaginationBar(Math.ceil(products.length / itemsPerPage));
});