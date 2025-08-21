document.addEventListener("DOMContentLoaded", () => {
  // DOM element references with null checks
  const productsContainer = document.getElementById("product-list");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const searchInput = document.querySelector(".search-container input");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const sortDropdown = document.querySelector(".sort-dropdown select");

  // Application state
  let currentPage = 1;
  let totalPages = 1;
  let currentCategory = "All";
  let currentSearch = "";
  let currentSort = "default";

  // Cart management - Single source of truth
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check login status for checkout
  function isUserLoggedIn() {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    return token && userEmail;
  }

  // Notification system
  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    // Create new notification
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }

  // Initialize sort dropdown options
  if (sortDropdown) {
    sortDropdown.innerHTML = `
      <option value="default">Sort by</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name: A to Z</option>
    `;
  }

  // Fetch products from API
  async function fetchProducts() {
    if (!productsContainer) return;

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(currentCategory !== "All" && { category: currentCategory }),
        ...(currentSearch && { search: currentSearch }),
        ...(currentSort !== "default" && { sort: currentSort }),
      });

      const response = await fetch(
        `http://localhost:5000/api/products?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      totalPages = data.pagination.pages;
      currentPage = data.pagination.page;

      renderProducts(data.products);
      updatePaginationControls();
    } catch (error) {
      console.error("Error fetching products:", error);
      if (productsContainer) {
        productsContainer.innerHTML = `
          <div class="error-message" style="text-align: center; padding: 2rem; color: var(--danger-color);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <h3>Failed to load products</h3>
            <p>Please check your connection and try again.</p>
            <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">Retry</button>
          </div>
        `;
      }
    }
  }

  // Render products in the container
  function renderProducts(products) {
    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    if (products.length === 0) {
      productsContainer.innerHTML = `
        <div class="no-products" style="text-align: center; padding: 3rem; color: var(--gray-600);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray-300);"></i>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      `;
      return;
    }

    products.forEach((product) => {
      const productCard = createProductCard(product);
      productsContainer.appendChild(productCard);
    });
  }

  // Create optimized product cards
  function createProductCard(product) {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.setAttribute("data-product-id", product._id);

    // Sanitize product data
    const sanitizedProduct = {
      id: product._id,
      name: product.name || "Unknown Product",
      price: parseFloat(product.price) || 0,
      image:
        product.image || "https://via.placeholder.com/300x300?text=No+Image",
      description: product.description || "No description available",
    };

    productDiv.innerHTML = `
      <div class="product-image">
        <img src="${sanitizedProduct.image}" 
             alt="${sanitizedProduct.name}" 
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
      </div>
      <div class="product-details">
        <h3 class="product-title">${sanitizedProduct.name}</h3>
        <p class="product-price">₹${sanitizedProduct.price.toFixed(2)}</p>
        <p class="product-description">${sanitizedProduct.description}</p>
        <div class="product-quantity">
          <label>Qty:</label>
          <div class="quantity-controls">
            <button class="quantity-btn decrease" type="button">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button class="quantity-btn increase" type="button">+</button>
          </div>
        </div>
        <div class="product-button-container">
          <button class="add-to-cart-btn" type="button">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    // Add event listeners using event delegation for better performance
    const quantityControls = productDiv.querySelector(".quantity-controls");
    const quantityInput = productDiv.querySelector(".quantity-input");
    const addToCartBtn = productDiv.querySelector(".add-to-cart-btn");

    // Quantity control events
    quantityControls.addEventListener("click", (e) => {
      if (e.target.classList.contains("decrease") && quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      } else if (
        e.target.classList.contains("increase") &&
        quantityInput.value < 99
      ) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      }
    });

    // Add to cart event
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(quantityInput.value) || 1;
      addToCart(sanitizedProduct, quantity);
      quantityInput.value = "1"; // Reset quantity
    });

    return productDiv;
  }

  // Optimized cart functions
  function addToCart(product, quantity = 1) {
    if (!product?.id) {
      showNotification("Invalid product data!", "error");
      return;
    }

    const validatedProduct = {
      id: product.id,
      name: product.name || "Unknown Product",
      price: parseFloat(product.price) || 0,
      image: product.image || "",
      description: product.description || "",
      quantity: parseInt(quantity) || 1,
      dateAdded: new Date().toISOString(),
    };

    const existingItemIndex = cart.findIndex(
      (item) => item.id === validatedProduct.id
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += validatedProduct.quantity;
    } else {
      cart.push(validatedProduct);
    }

    saveCartToLocalStorage();
    updateCartBadge();
    updateCartDisplay();
    showNotification(
      `Added ${validatedProduct.quantity} ${validatedProduct.name} to cart!`,
      "success"
    );
  }

  function removeFromCart(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex > -1) {
      const removedItem = cart[itemIndex];

      // Add animation before removal
      const cartItemElement = document.querySelector(
        `[data-item-id="${productId}"]`
      );
      if (cartItemElement) {
        cartItemElement.classList.add("removing");
        setTimeout(() => {
          cart.splice(itemIndex, 1);
          saveCartToLocalStorage();
          updateCartBadge();
          updateCartDisplay();
          showNotification(`${removedItem.name} removed from cart!`, "warning");
        }, 300);
      } else {
        cart.splice(itemIndex, 1);
        saveCartToLocalStorage();
        updateCartBadge();
        updateCartDisplay();
        showNotification(`${removedItem.name} removed from cart!`, "warning");
      }
    }
  }

  function clearCart() {
    if (cart.length === 0) {
      showNotification("Cart is already empty!", "info");
      return;
    }

    if (confirm("Are you sure you want to clear all items from your cart?")) {
      cart = [];
      saveCartToLocalStorage();
      updateCartBadge();
      updateCartDisplay();
      showNotification("Cart cleared successfully!", "success");
    }
  }

  function updateCartItemQuantity(productId, change) {
    const item = cart.find((item) => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= 99) {
      item.quantity = newQuantity;
      saveCartToLocalStorage();
      updateCartDisplay();
      updateCartBadge();
    }
  }

  // Utility functions
  function saveCartToLocalStorage() {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
      showNotification("Error saving cart!", "error");
    }
  }

  function updateCartBadge() {
    const totalItems = cart.reduce(
      (sum, item) => sum + (parseInt(item.quantity) || 0),
      0
    );
    const cartBadge = document.querySelector(".cart-badge");

    if (cartBadge) {
      cartBadge.textContent = totalItems;
      if (totalItems > 0) {
        cartBadge.style.animation = "pulse 0.3s ease-in-out";
        setTimeout(() => (cartBadge.style.animation = ""), 300);
      }
    }
  }

  // Optimized cart display functions
  function updateCartDisplay() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const emptyMessage = document.getElementById("empty-cart-message");

    if (!cartItems) return; // Not on a page with cart

    if (cart.length === 0) {
      if (emptyMessage) emptyMessage.style.display = "block";
      if (cartTotal) cartTotal.style.display = "none";
      if (checkoutBtn) checkoutBtn.style.display = "none";

      // Clear non-empty cart items
      Array.from(cartItems.children).forEach((child) => {
        if (!child.classList.contains("empty-cart")) {
          child.remove();
        }
      });
    } else {
      if (emptyMessage) emptyMessage.style.display = "none";
      if (cartTotal) cartTotal.style.display = "block";
      if (checkoutBtn) checkoutBtn.style.display = "flex";

      // Clear existing items
      Array.from(cartItems.children).forEach((child) => {
        if (!child.classList.contains("empty-cart")) {
          child.remove();
        }
      });

      // Add cart items efficiently
      const fragment = document.createDocumentFragment();
      cart.forEach((item) => {
        fragment.appendChild(createCartItemElement(item));
      });
      cartItems.appendChild(fragment);

      updateCartTotal();
    }
  }

  function createCartItemElement(item) {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.setAttribute("data-item-id", item.id);

    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const subtotal = price * quantity;

    cartItem.innerHTML = `
      <img src="${
        item.image || "https://via.placeholder.com/80x80?text=No+Image"
      }" 
           alt="${item.name || "Product"}" 
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name || "Unknown Product"}</h4>
        <p class="cart-item-price">₹${price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <label>Qty:</label>
          <div class="quantity-controls">
            <button class="quantity-btn decrease" data-action="decrease" data-id="${
              item.id
            }">-</button>
            <input type="number" class="quantity-input" value="${quantity}" min="1" readonly>
            <button class="quantity-btn increase" data-action="increase" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
      <div class="cart-item-subtotal">₹${subtotal.toFixed(2)}</div>
      <button class="remove-item-btn" data-action="remove" data-id="${item.id}">
        <i class="fas fa-trash"></i> Remove
      </button>
    `;

    return cartItem;
  }

  function updateCartTotal() {
    const cartTotal = document.getElementById("cart-total");
    if (!cartTotal) return;

    const subtotal = cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + price * quantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over ₹50
    const total = subtotal + tax + shipping;
    const totalItems = cart.reduce(
      (total, item) => total + (parseInt(item.quantity) || 1),
      0
    );

    cartTotal.innerHTML = `
      <div class="cart-total-row">
        <span>Subtotal (${totalItems} items):</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span>Tax (8%):</span>
        <span>₹${tax.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span>Shipping:</span>
        <span>${shipping === 0 ? "Free" : "₹" + shipping.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span><strong>Total:</strong></span>
        <span><strong>₹${total.toFixed(2)}</strong></span>
      </div>
    `;
  }

  // Pagination and event handling
  function updatePaginationControls() {
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
  }

  // Event listeners with optimized performance
  function initializeEventListeners() {
    // Pagination events
    prevPageBtn?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchProducts();
      }
    });

    nextPageBtn?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchProducts();
      }
    });

    // Search with debouncing
    let searchTimeout;
    searchInput?.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchProducts();
      }, 300);
    });

    // Category filter
    categoryButtons?.forEach((button) => {
      button.addEventListener("click", () => {
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentCategory = button.textContent;
        currentPage = 1;
        fetchProducts();
      });
    });

    // Sort dropdown
    sortDropdown?.addEventListener("change", () => {
      currentSort = sortDropdown.value;
      currentPage = 1;
      fetchProducts();
    });

    // Checkout button
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn?.addEventListener("click", () => {
      if (cart.length === 0) {
        showNotification("Your cart is empty!", "warning");
        return;
      }
      localStorage.setItem("checkoutCart", JSON.stringify(cart));
      window.location.href = "checkout.html";
    });

    // Delegated event handling for cart items
    document.addEventListener("click", (e) => {
      const { action, id } = e.target.dataset;

      if (action === "increase") {
        updateCartItemQuantity(id, 1);
      } else if (action === "decrease") {
        updateCartItemQuantity(id, -1);
      } else if (action === "remove") {
        removeFromCart(id);
      }
    });
  }

  // Cart validation and cleanup
  function validateAndCleanCart() {
    cart = cart
      .filter((item) => item?.id && !isNaN(parseFloat(item.price)))
      .map((item) => ({
        id: item.id,
        name: item.name || "Unknown Product",
        price: parseFloat(item.price) || 0,
        image: item.image || "",
        description: item.description || "",
        quantity: parseInt(item.quantity) || 1,
        dateAdded: item.dateAdded || new Date().toISOString(),
      }));

    saveCartToLocalStorage();
  }

  // Make functions globally available for backward compatibility
  window.updateCartItemQuantity = updateCartItemQuantity;
  window.removeFromCart = removeFromCart;

  // Initialize application
  validateAndCleanCart();
  initializeEventListeners();

  if (productsContainer) {
    fetchProducts();
  }

  updateCartBadge();
  updateCartDisplay();
});

// Optimized Mobile Menu Functionality
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navOverlay = document.getElementById("nav-overlay");
  const body = document.body;

  if (!menuToggle || !navMenu || !navOverlay) return;

  function toggleMobileMenu() {
    const isActive = menuToggle.classList.contains("active");
    const action = isActive ? "remove" : "add";

    menuToggle.classList[action]("active");
    navMenu.classList[action]("mobile-menu", "active");
    navOverlay.classList[action]("active");
    body.classList[action]("menu-open");
  }

  function closeMobileMenu() {
    ["menuToggle", "navMenu", "navOverlay", "body"].forEach(
      (element, index) => {
        const el = [menuToggle, navMenu, navOverlay, body][index];
        if (el) {
          const classes = index === 1 ? ["mobile-menu", "active"] : ["active"];
          if (index === 3) classes.push("menu-open");
          el.classList.remove(...classes);
        }
      }
    );
  }

  // Event listeners
  menuToggle.addEventListener("click", toggleMobileMenu);
  navOverlay.addEventListener("click", closeMobileMenu);

  // Close menu when clicking on menu items
  navMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn") || e.target.id === "cart-icon") {
      closeMobileMenu();
    }
  });

  // Handle window resize and escape key
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
});
