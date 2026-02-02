let productItems = JSON.parse(localStorage.getItem("products")) || [];

// Build brand list dynamically from products
const brandSet = new Set(productItems.map(p => p.brand));
const brandList = Array.from(brandSet).map(brand => ({
  label: brand,
  key: brand
}));

// Track selected brands
const selectedBrands = new Map();
const brandButtons = new Map();
brandList.forEach(brand => selectedBrands.set(brand.key, false));

// Filter container (what’s currently displayed)
let filteredItems = productItems.slice(); // start with all products
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
			<img src="${"../../../" + item.image}" alt="${item.name}" />
			<div class="info">
				<h3>${item.name}</h3>
				<div class="category">${item.brand}</div>
				<div class="price">$${item.price.toFixed(2)}</div>
			</div>
			<button class="edit-btn">Edit</button>
		</div>
		<div class="product-description">${item.description}</div>
		<div class="product-stats">
			<div class="stats-left">
				<div>Tag: ${item.tag}</div>
				<div>Colors: ${item.colors.map(c => c.name).join(", ")}</div>
				<div>Sizes: ${item.sizes.map(s => s.val).join(", ")}</div>
			</div>
			<div class="amount-display">Amount: ${item.amount}</div>
		</div>
	`;

	// Attach event listener to the edit button
	card.querySelector(".edit-btn").addEventListener("click", () => openEditPanel(item));
	return card;
}

function openEditPanel(item) {
	const panel = document.createElement("div");
	panel.className = "edit-panel";

	// Build color inputs (still editable by name)
	const colorInputs = item.colors.map((c, i) => `
		<label>Color ${i + 1}:
			<input type="text" value="${c.name}" class="edit-color" data-index="${i}" />
		</label>
	`).join("");

	// Build size checkboxes
	const sizeInputs = item.sizes.map((s, i) => `
		<label>
			<input type="checkbox" class="edit-size" data-index="${i}" ${s.available ? "checked" : ""} />
			Size ${s.val}
		</label>
	`).join("");

	panel.innerHTML = `
		<h2>Edit Product</h2>
		<label>Name: <input type="text" value="${item.name}" id="edit-name" /></label>
		<label>Brand: <input type="text" value="${item.brand}" id="edit-brand" /></label>
		<label>Price: <input type="number" value="${item.price}" id="edit-price" /></label>
		<label>Tag: <input type="text" value="${item.tag}" id="edit-tag" /></label>
		<label>Description: <textarea id="edit-description">${item.description}</textarea></label>
		<label>Amount: <input type="number" value="${item.amount}" id="edit-amount" /></label>

		<h3>Colors</h3>
		${colorInputs}

		<h3>Sizes</h3>
		${sizeInputs}

		<div class="panel-actions">
			<button id="cancel-edit">Cancel</button>
			<button id="save-edit">Save</button>
		</div>
	`;

	document.body.appendChild(panel);

	// Cancel button
	document.getElementById("cancel-edit").addEventListener("click", () => {
		panel.remove();
	});

	// Save button
	document.getElementById("save-edit").addEventListener("click", () => {
		item.name = document.getElementById("edit-name").value;
		item.brand = document.getElementById("edit-brand").value;
		item.price = parseFloat(document.getElementById("edit-price").value);
		item.tag = document.getElementById("edit-tag").value;
		item.description = document.getElementById("edit-description").value;
		item.amount = parseInt(document.getElementById("edit-amount").value, 10);

		// Update colors
		document.querySelectorAll(".edit-color").forEach(input => {
			const idx = parseInt(input.dataset.index, 10);
			item.colors[idx].name = input.value;
		});

		// Update sizes availability
		document.querySelectorAll(".edit-size").forEach(input => {
			const idx = parseInt(input.dataset.index, 10);
			item.sizes[idx].available = input.checked;
		});

		// Save back to localStorage
		const index = productItems.findIndex(p => p.id === item.id);
		if (index !== -1) {
			productItems[index] = item;
			localStorage.setItem("products", JSON.stringify(productItems));
		}

		// Refresh UI
		filterItems();
		panel.remove();
	});
}

// -----------------------------
// Filter
// -----------------------------

// Filter items based on categories
function filterItems() {
	const activeBrands = Array.from(selectedBrands.entries())
		.filter(([_, isSelected]) => isSelected)
		.map(([brand]) => brand);

	let filtered;

	if (activeBrands.length === 0) {
		filtered = productItems.slice(); // all products
	} else {
		filtered = productItems.filter(item => activeBrands.includes(item.brand));
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
  	updateBrandCounts(productItems);
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
	updateBrandCounts(productItems);
}


// -----------------------------
// Initialize
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
	productItems = JSON.parse(localStorage.getItem("products")) || [];
	renderBrandBar();
	refreshBrandCounts();
	filterItems(); // ensures all items are shown by default
	renderPaginationBar(Math.ceil(productItems.length / itemsPerPage));
});