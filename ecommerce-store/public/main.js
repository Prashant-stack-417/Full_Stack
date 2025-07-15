document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("product-list");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const searchInput = document.querySelector(".search-container input");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const sortDropdown = document.querySelector(".sort-dropdown select");

  let currentPage = 1;
  let totalPages = 1;
  let currentCategory = "All";
  let currentSearch = "";
  let currentSort = "default";

  async function fetchProducts() {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 8);

      if (currentCategory !== "All") {
        params.append("category", currentCategory);
      }
      if (currentSearch) {
        params.append("search", currentSearch);
      }
      if (currentSort !== "default") {
        params.append("sort", currentSort);
      }

      const response = await fetch(
        `http://localhost:5000/api/products?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      totalPages = data.pagination.pages;
      currentPage = data.pagination.page;

      renderProducts(data.products);
      updatePaginationControls();
    } catch (error) {
      console.error("Error fetching products:", error);
      productsContainer.innerHTML = "<p>Failed to load products.</p>";
    }
  }

  // Function to create product cards
  function createProductCard(product) {
    const template = document.getElementById("product-template");

    // If template is not available, create product card manually
    if (!template) {
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      // Create product image
      const imageDiv = document.createElement("div");
      imageDiv.className = "product-image";
      const img = document.createElement("img");
      img.src = product.image || "placeholder.jpg";
      img.alt = product.name;
      imageDiv.appendChild(img);

      // Create product details
      const detailsDiv = document.createElement("div");
      detailsDiv.className = "product-details";

      // Product title
      const title = document.createElement("h3");
      title.className = "product-title";
      title.textContent = product.name;

      // Product price
      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = `₹${product.price.toFixed(2)}`;

      // Product description
      const description = document.createElement("p");
      description.className = "product-description";
      description.textContent = product.description;

      // Quantity controls
      const quantityDiv = document.createElement("div");
      quantityDiv.className = "product-quantity";

      const quantityLabel = document.createElement("label");
      quantityLabel.textContent = "Qty:";

      const quantityControls = document.createElement("div");
      quantityControls.className = "quantity-controls";

      const decreaseBtn = document.createElement("button");
      decreaseBtn.className = "quantity-btn decrease";
      decreaseBtn.textContent = "-";

      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.className = "quantity-input";
      quantityInput.value = "1";
      quantityInput.min = "1";
      quantityInput.max = "99";

      const increaseBtn = document.createElement("button");
      increaseBtn.className = "quantity-btn increase";
      increaseBtn.textContent = "+";

      quantityControls.appendChild(decreaseBtn);
      quantityControls.appendChild(quantityInput);
      quantityControls.appendChild(increaseBtn);

      quantityDiv.appendChild(quantityLabel);
      quantityDiv.appendChild(quantityControls);

      // Button container for add and remove buttons
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "product-button-container";

      // Add to cart button
      const addToCartBtn = document.createElement("button");
      addToCartBtn.className = "add-to-cart-btn";
      addToCartBtn.innerHTML =
        '<i class="fas fa-shopping-cart"></i> Add to Cart';

      // Remove from cart button
      const removeFromCartBtn = document.createElement("button");
      removeFromCartBtn.className = "remove-from-cart-btn";
      removeFromCartBtn.innerHTML = '<i class="fas fa-trash"></i> Remove';
      removeFromCartBtn.style.display = "none"; // Initially hidden

      // Add buttons to container
      buttonContainer.appendChild(addToCartBtn);
      buttonContainer.appendChild(removeFromCartBtn);

      // Append all elements to details div
      detailsDiv.appendChild(title);
      detailsDiv.appendChild(price);
      detailsDiv.appendChild(description);
      detailsDiv.appendChild(quantityDiv);
      detailsDiv.appendChild(buttonContainer);

      // Append image and details to product div
      productDiv.appendChild(imageDiv);
      productDiv.appendChild(detailsDiv);

      // Add event listeners
      decreaseBtn.addEventListener("click", () => {
        if (quantityInput.value > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
        }
      });

      increaseBtn.addEventListener("click", () => {
        if (quantityInput.value < 99) {
          quantityInput.value = parseInt(quantityInput.value) + 1;
        }
      });

      addToCartBtn.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value);
        addToCart(product, quantity);

        // Visual feedback
        addToCartBtn.classList.add("added");
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';

        // Show remove button
        removeFromCartBtn.style.display = "block";

        setTimeout(() => {
          addToCartBtn.classList.remove("added");
          addToCartBtn.innerHTML =
            '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 2000);
      });

      removeFromCartBtn.addEventListener("click", () => {
        removeFromCart(product._id);
        removeFromCartBtn.style.display = "none";
      });

      // Check if product is already in cart and show remove button if it is
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isInCart = cart.some((item) => item.product._id === product._id);
      if (isInCart) {
        removeFromCartBtn.style.display = "block";
      }

      return productDiv;
    }

    // If template is available, use it
    const productCard = document.importNode(template.content, true);

    // Set product data
    const img = productCard.querySelector(".product-image img");
    img.src = product.image || "placeholder.jpg";
    img.alt = product.name;

    productCard.querySelector(".product-title").textContent = product.name;
    productCard.querySelector(
      ".product-price"
    ).textContent = `₹${product.price.toFixed(2)}`;
    productCard.querySelector(".product-description").textContent =
      product.description;

    // Add event listeners
    const quantityInput = productCard.querySelector(".quantity-input");
    const decreaseBtn = productCard.querySelector(".decrease");
    const increaseBtn = productCard.querySelector(".increase");

    decreaseBtn.addEventListener("click", () => {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      if (quantityInput.value < 99) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      }
    });

    // Create button container if it doesn't exist
    let buttonContainer = productCard.querySelector(
      ".product-button-container"
    );
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "product-button-container";
      const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
      addToCartBtn.parentNode.insertBefore(buttonContainer, addToCartBtn);
      buttonContainer.appendChild(addToCartBtn);
    }

    // Add remove from cart button if it doesn't exist
    let removeFromCartBtn = productCard.querySelector(".remove-from-cart-btn");
    if (!removeFromCartBtn) {
      removeFromCartBtn = document.createElement("button");
      removeFromCartBtn.className = "remove-from-cart-btn";
      removeFromCartBtn.innerHTML = '<i class="fas fa-trash"></i> Remove';
      removeFromCartBtn.style.display = "none"; // Initially hidden
      buttonContainer.appendChild(removeFromCartBtn);
    }

    const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(quantityInput.value);
      addToCart(product, quantity);

      // Visual feedback
      addToCartBtn.classList.add("added");
      addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';

      // Show remove button
      removeFromCartBtn.style.display = "block";

      setTimeout(() => {
        addToCartBtn.classList.remove("added");
        addToCartBtn.innerHTML =
          '<i class="fas fa-shopping-cart"></i> Add to Cart';
      }, 2000);
    });

    removeFromCartBtn.addEventListener("click", () => {
      removeFromCart(product._id);
      removeFromCartBtn.style.display = "none";
    });

    // Check if product is already in cart and show remove button if it is
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isInCart = cart.some((item) => item.product._id === product._id);
    if (isInCart) {
      removeFromCartBtn.style.display = "block";
    }

    return productCard;
  }

  // Function to render products
  function renderProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    if (products.length === 0) {
      productList.innerHTML =
        '<div class="no-products">No products found</div>';
      return;
    }

    products.forEach((product) => {
      const productCard = createProductCard(product);
      productList.appendChild(productCard);
    });
  }

  function addToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItemIndex = cart.findIndex(
      (item) => item.product._id === product._id
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        product: product,
        quantity: quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    showNotification(`Added ${quantity} ${product.name} to cart!`);
  }

  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
      cartBadge.textContent = totalItems;
    }
  }

  function showNotification(message) {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.style.display = "block";

      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    }
  }

  function updatePaginationControls() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchProducts();
    }
  });

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchProducts();
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.textContent;
      currentPage = 1;
      fetchProducts();
    });
  });

  sortDropdown.addEventListener("change", () => {
    currentSort = sortDropdown.value;
    currentPage = 1;
    fetchProducts();
  });

  function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Find the item in the cart
    const existingItemIndex = cart.findIndex(
      (item) => item.product._id === productId
    );

    if (existingItemIndex !== -1) {
      // Remove the item from the cart
      cart.splice(existingItemIndex, 1);

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update cart badge
      updateCartBadge();

      // Show notification
      showNotification("Item removed from cart!");

      // Check if we're on the cart page and update if needed
      const cartItemsContainer = document.getElementById("cart-items");
      if (cartItemsContainer) {
        renderCart();
      }
    }
  }

  // Add this function to handle cart rendering
  function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");

    if (!cartItemsContainer) return; // Not on cart page

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="empty-cart">Your cart is empty</p>';
      cartTotalElement.textContent = "Total: ₹0.00";
      return;
    }

    let cartHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      cartHTML += `
        <div class="cart-item" data-id="${item.product._id}">
          <img src="${item.product.image || "placeholder.jpg"}" alt="${
        item.product.name
      }">
          <div class="cart-item-details">
            <h3 class="cart-item-title">${item.product.name}</h3>
            <p class="cart-item-price">₹${item.product.price.toFixed(2)}</p>
          </div>
          <div class="cart-item-quantity">
            <button class="decrease-cart-qty">-</button>
            <input type="number" value="${item.quantity}" min="1" max="99">
            <button class="increase-cart-qty">+</button>
          </div>
          <p class="cart-item-subtotal">₹${itemTotal.toFixed(2)}</p>
          <button class="remove-from-cart-btn" data-id="${item.product._id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `Total: ₹${total.toFixed(2)}`;

    // Add event listeners to cart item buttons
    document.querySelectorAll(".decrease-cart-qty").forEach((button) => {
      button.addEventListener("click", function () {
        const cartItem = this.closest(".cart-item");
        const productId = cartItem.dataset.id;
        const quantityInput = cartItem.querySelector("input");

        if (quantityInput.value > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
          updateCartItemQuantity(productId, parseInt(quantityInput.value));
        }
      });
    });

    document.querySelectorAll(".increase-cart-qty").forEach((button) => {
      button.addEventListener("click", function () {
        const cartItem = this.closest(".cart-item");
        const productId = cartItem.dataset.id;
        const quantityInput = cartItem.querySelector("input");

        if (quantityInput.value < 99) {
          quantityInput.value = parseInt(quantityInput.value) + 1;
          updateCartItemQuantity(productId, parseInt(quantityInput.value));
        }
      });
    });

    document.querySelectorAll(".cart-item-quantity input").forEach((input) => {
      input.addEventListener("change", function () {
        const cartItem = this.closest(".cart-item");
        const productId = cartItem.dataset.id;
        const quantity = parseInt(this.value);

        if (quantity >= 1 && quantity <= 99) {
          updateCartItemQuantity(productId, quantity);
        }
      });
    });

    document.querySelectorAll(".remove-from-cart-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.dataset.id;
        removeFromCart(productId);
      });
    });
  }

  // Add this function to update cart item quantity
  function updateCartItemQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItemIndex = cart.findIndex(
      (item) => item.product._id === productId
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update the cart display
      renderCart();
      updateCartBadge();
    }
  }

  fetchProducts();
  updateCartBadge();
});
