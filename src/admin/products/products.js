import products from "../../globals/initilization.js"


// Build brand list dynamically from products
const brandSet = new Set(products.map(p => p.brand));
const brandList = Array.from(brandSet).map(brand => ({
  label: brand,
  key: brand
}));

// Track selected brands
const selectedBrands = new Map();
const brandButtons = new Map();
brandList.forEach(brand => selectedBrands.set(brand.key, false));

// Filter container (what’s currently displayed)
let filteredItems = products.slice(); // start with all products
let pageIndex = 1;
const itemsPerPage = 9;

// -----------------------------
// Item
// -----------------------------

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
// Filter
// -----------------------------

// Add item to filter results
function addToFilter(item) {
	filteredItems.push(item);
	refreshBrandCounts();
}

// Remove item from filter results by index
function removeFromFilter(index) {
if (index >= 0 && index < filteredItems.length) {
	filteredItems.splice(index, 1);
	refreshBrandCounts();
}
}

// Filter items based on categories
function filterItems() {
	const activeBrands = Array.from(selectedBrands.entries())
		.filter(([_, isSelected]) => isSelected)
		.map(([brand]) => brand);

	let filtered;

	if (activeBrands.length === 0) {
		filtered = products.slice(); // all products
	} else {
		filtered = products.filter(item => activeBrands.includes(item.brand));
	}

	filteredItems = filtered;
	const pageSlice = filteredItems.slice((pageIndex - 1) * itemsPerPage, pageIndex * itemsPerPage);
	renderItems(pageSlice);

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	renderPaginationBar(totalPages);
}

function renderItems(items) {
	const grid = document.getElementById("product-grid");
	grid.innerHTML = "";

	items.forEach(item => {
		grid.appendChild(renderItem(item));
	});
}

// Go to a specific page
function goToPage(page) {
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	if (page < 1 || page > totalPages) return;

	pageIndex = page;

	const start = (pageIndex - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	const pageSlice = filteredItems.slice(start, end);
	renderItems(pageSlice);
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

function updateBrandCounts(items) {
	brandList.forEach(({ key }) => {
		const btn = document.querySelector(`.brand-count[data-brand="${key}"]`);
		if (btn) btn.textContent = "0";
	});

	items.forEach(item => {
		const btn = document.querySelector(`.brand-count[data-brand="${item.brand}"]`);
		if (btn) {
		const currentCount = parseInt(btn.textContent, 10) || 0;
		btn.textContent = currentCount + 1;
		}
	});
}

function refreshBrandCounts() {
  	updateBrandCounts(products);
}

function createBrandButton({ label, key }) {
	const container = document.createElement("div");
	container.className = "brand-button";
	container.setAttribute("data-brand", key);

	const nameSpan = document.createElement("span");
	nameSpan.textContent = label;

	const countBtn = document.createElement("button");
	countBtn.className = "brand-count";
	countBtn.textContent = "0";
	countBtn.setAttribute("data-brand", key);

	// Entire container is clickable
	container.addEventListener("click", () => {
		const current = selectedBrands.get(key);
		selectedBrands.set(key, !current);

		// Remove all highlights
		document.querySelectorAll(".brand-count").forEach(btn => {
		btn.classList.remove("active");
		});

		// Highlight selected ones
		selectedBrands.forEach((isSelected, brand) => {
		const btn = document.querySelector(`.brand-count[data-brand="${brand}"]`);
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

function renderBrandBar() {
	const sidebar = document.querySelector(".sidebar");
	const section = document.createElement("div");
	section.className = "brand-section";

	const title = document.createElement("h2");
	title.textContent = "Brands";
	section.appendChild(title);

	brandList.forEach(brand => {
		section.appendChild(createBrandButton(brand));
	});

	sidebar.appendChild(section);

	// Update counts after buttons are created
	updateBrandCounts(products);
}


// -----------------------------
// Initialize
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
	renderBrandBar();
	refreshBrandCounts();
	filterItems(); // ensures all items are shown by default
	renderPaginationBar(Math.ceil(products.length / itemsPerPage));
});