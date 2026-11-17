const API_URL = "https://dummyjson.com/products?limit=0";
const CATEGORY_URL = "https://dummyjson.com/products/category-list";
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const categorySelect = document.getElementById("categorySelect");
const categoryGrid = document.getElementById("categoryGrid");
const sortSelect = document.getElementById("sortSelect");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const noResults = document.getElementById("noResults");
const resultCount = document.getElementById("resultCount");
const retryBtn = document.getElementById("retryBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const viewAllBtn = document.getElementById("viewAllBtn");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");
let allProducts = [];
let selectedCategory = "";
async function fetchProducts() {
    loading.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    noResults.classList.add("hidden");
    productGrid.innerHTML = "";
    resultCount.textContent = "Loading products...";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        allProducts = data.products;
        if (!Array.isArray(allProducts)) {
            throw new Error("Invalid product data");
        }
        await fetchCategories();
        displayProducts(allProducts);
    } catch (error) {
        console.error("API Error:", error);
        loading.classList.add("hidden");
        productGrid.innerHTML = "";
        errorMessage.classList.remove("hidden");
        resultCount.textContent = "Unable to load products.";
    } finally {
        loading.classList.add("hidden");
    }
}
async function fetchCategories() {
    try {
        const response = await fetch(CATEGORY_URL);
        if (!response.ok) {
            throw new Error("Unable to fetch categories");
        }
        const categories = await response.json();
        categorySelect.innerHTML =
            '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = formatCategory(category);
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Category Error:", error);
    }
}
function formatCategory(category) {
    return category
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

}
function displayProducts(products) {
    productGrid.innerHTML = "";
    noResults.classList.add("hidden");
    errorMessage.classList.add("hidden");
    resultCount.textContent =
        `Showing ${products.length} Products`;
    if (products.length === 0) {
        noResults.classList.remove("hidden");
        resultCount.textContent = "0 Products Found";
        return;
    }
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img
                src="${escapeHTML(product.thumbnail)}"
                alt="${escapeHTML(product.title)}"
                class="product-image"
                loading="lazy"
            >
            <div class="product-info">
                <span class="product-category">
                    ${escapeHTML(formatCategory(product.category))}
                </span>
                <h3>${escapeHTML(product.title)}</h3>
                <p class="product-description">
                    ${escapeHTML(product.description)}
                </p>
                <div class="product-bottom">
                    <span class="product-price">
                        $${Number(product.price).toFixed(2)}
                    </span>
                    <span class="product-rating">
                        ⭐ ${Number(product.rating).toFixed(1)}
                    </span>
                </div>
                <button class="product-details-btn" type="button">
                    View Details
                </button>
            </div>
        `;
        card.querySelector(".product-details-btn")
            .addEventListener("click", () => {
                showProductDetails(product);
            });
        productGrid.appendChild(card);
    });
}
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}
function filterProducts() {
    const searchText = searchInput.value
        .trim()
        .toLowerCase();
    let filteredProducts = allProducts.filter(product => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchText);
        const matchesCategory =
            !selectedCategory ||
            product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const sortValue = sortSelect.value;
    if (sortValue === "low") {
        filteredProducts.sort(
            (a, b) => a.price - b.price
        );
    } else if (sortValue === "high") {
        filteredProducts.sort(
            (a, b) => b.price - a.price
        );
    } else if (sortValue === "name") {
        filteredProducts.sort(
            (a, b) => a.title.localeCompare(b.title)
        );
    }
    displayProducts(filteredProducts);

}
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    selectedCategory = categorySelect.value;
    filterProducts();
    document.getElementById("products")
        .scrollIntoView({ behavior: "smooth" });
});
categorySelect.addEventListener("change", function() {
    selectedCategory = this.value;
    filterProducts();
});
categoryGrid.addEventListener("click", function(event) {
    const card = event.target.closest(".category-card");
    if (!card) return;
    selectedCategory = card.dataset.category;
    categorySelect.value = selectedCategory;
    searchInput.value = "";
    filterProducts();
    document.getElementById("products")
        .scrollIntoView({ behavior: "smooth" });
});
sortSelect.addEventListener("change", function() {
    filterProducts();
});
viewAllBtn.addEventListener("click", function() {
    clearAllFilters();
    document.getElementById("products")
        .scrollIntoView({ behavior: "smooth" });
});
function clearAllFilters() {
    searchInput.value = "";
    categorySelect.value = "";
    sortSelect.value = "default";
    selectedCategory = "";
    displayProducts(allProducts);
}
clearFiltersBtn.addEventListener("click", clearAllFilters);
retryBtn.addEventListener("click", function() {
    fetchProducts();
});
function showProductDetails(product) {
    const oldModal = document.getElementById("productModal");
    if (oldModal) {
        oldModal.remove();
    }
    const modal = document.createElement("div");
    modal.id = "productModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" aria-label="Close">
                &times;
            </button>
            <img
                src="${escapeHTML(product.thumbnail)}"
                alt="${escapeHTML(product.title)}"
                class="modal-image"
            >
            <span class="product-category">
                ${escapeHTML(formatCategory(product.category))}
            </span>
            <h2>${escapeHTML(product.title)}</h2>
            <p class="modal-description">
                ${escapeHTML(product.description)}
            </p>
            <h3 class="modal-price">
                Price: $${Number(product.price).toFixed(2)}
            </h3>
            <p>⭐ Rating: ${Number(product.rating).toFixed(1)}</p>
            <p>Brand: ${escapeHTML(product.brand || "Not Available")}</p>
            <p>Availability:
                ${escapeHTML(product.availabilityStatus || "Not Available")}
            </p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".modal-close")
        .addEventListener("click", () => modal.remove());
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}
menuBtn.addEventListener("click", function() {
    navLinks.classList.toggle("show");
});
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function() {
        navLinks.classList.remove("show");
    });
});
fetchProducts();
