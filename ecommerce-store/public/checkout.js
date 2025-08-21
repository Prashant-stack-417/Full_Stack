// Authentication and Utility Functions
// Add global error handler for unhandled promise rejections
window.addEventListener("unhandledrejection", function (event) {
  console.warn("Unhandled promise rejection:", event.reason);
  // Prevent the default browser behavior (logging the error to console)
  async function processCODPayment(orderData) {
    // COD is always successful but pending
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        try {
          resolve({
            success: true,
            transactionId:
              "COD_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 9),
            method: "Cash on Delivery",
            amount: orderData.totals.total,
            status: "pending_payment",
          });
        } catch (error) {
          resolve({
            success: false,
            error: "COD processing error: " + error.message,
            method: "Cash on Delivery",
            amount: orderData.totals.total,
            status: "failed",
          });
        }
      }, 1000);

      // Add timeout cleanup
      const cleanup = () => clearTimeout(timeoutId);
      resolve = ((originalResolve) => (value) => {
        cleanup();
        originalResolve(value);
      })(resolve);
    });
  }
  ault();
});

// Add global error handler for runtime errors
window.addEventListener("error", function (event) {
  // Ignore async message channel errors from browser extensions
  if (event.message && event.message.includes("message channel closed")) {
    event.preventDefault();
    return;
  }
});
function isUserLoggedIn() {
  const token = localStorage.getItem("authToken");
  const userEmail = localStorage.getItem("userEmail");
  return token && userEmail;
}

function getUserInfo() {
  return {
    email: localStorage.getItem("userEmail"),
    token: localStorage.getItem("authToken"),
    isAdmin: localStorage.getItem("isAdmin") === "true",
  };
}

function redirectToLogin() {
  localStorage.setItem("redirectAfterLogin", "checkout.html");
  window.location.href = "login.html";
}

function showLoginModal() {
  const modal = document.createElement("div");
  modal.className = "login-modal-overlay";
  modal.innerHTML = `
        <div class="login-modal">
            <div class="login-modal-header">
                <h3><i class="fas fa-lock"></i> Login Required</h3>
                <button class="close-modal" onclick="this.closest('.login-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="login-modal-body">
                <p>You need to be logged in to place an order.</p>
                <div class="login-modal-actions">
                    <button class="btn login-btn" onclick="redirectToLogin()">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                    <button class="btn signup-btn" onclick="window.location.href='signup.html'">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </div>
            </div>
        </div>
    `;

  // Add modal styles
  const style = document.createElement("style");
  style.textContent = `
        .login-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        }
        .login-modal {
            background: var(--white);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            max-width: 400px;
            width: 90%;
            overflow: hidden;
        }
        .login-modal-header {
            background: var(--primary-color);
            color: var(--white);
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .login-modal-header h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .close-modal {
            background: none;
            border: none;
            color: var(--white);
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: var(--border-radius);
        }
        .close-modal:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        .login-modal-body {
            padding: 2rem;
            text-align: center;
        }
        .login-modal-body p {
            margin-bottom: 2rem;
            color: var(--gray-600);
            font-size: 1.1rem;
        }
        .login-modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        .login-btn {
            background: var(--primary-color);
        }
        .signup-btn {
            background: var(--secondary-color);
        }
    `;
  document.head.appendChild(style);
  document.body.appendChild(modal);
}

// Payment Processing Functions
async function processPayment(orderData, paymentMethod) {
  switch (paymentMethod) {
    case "credit-card":
      return await processCreditCardPayment(orderData);
    case "upi":
      return await processUPIPayment(orderData);
    case "cod":
      return await processCODPayment(orderData);
    default:
      throw new Error("Invalid payment method");
  }
}

async function processCreditCardPayment(orderData) {
  // Get card details for validation
  const cardNumber =
    document.getElementById("card-number")?.value?.replace(/\s/g, "") || "";
  const cardHolder =
    document.getElementById("card-holder")?.value?.trim() || "";
  const cardExpiry = document.getElementById("card-expiry")?.value || "";
  const cardCvv = document.getElementById("card-cvv")?.value || "";

  // Validate card details
  if (!validateCardDetails(cardNumber, cardHolder, cardExpiry, cardCvv)) {
    throw new Error("Please check your card details and try again.");
  }

  // Simulate secure credit card processing with proper error handling
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      try {
        // Simulate random success/failure (95% success rate for valid cards)
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            transactionId:
              "CC_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 9),
            method: "Credit Card",
            amount: orderData.totals.total,
            status: "completed",
            cardLast4: cardNumber.slice(-4),
            cardType: getCardType(cardNumber),
          });
        } else {
          reject(
            new Error(
              "Credit card payment failed. Please check your card details."
            )
          );
        }
      } catch (error) {
        reject(new Error("Payment processing error: " + error.message));
      }
    }, 2000);

    // Add timeout cleanup
    const cleanup = () => clearTimeout(timeoutId);
    resolve = ((originalResolve) => (value) => {
      cleanup();
      originalResolve(value);
    })(resolve);
    reject = ((originalReject) => (reason) => {
      cleanup();
      originalReject(reason);
    })(reject);
  });
}

// Card validation functions
function validateCardDetails(cardNumber, cardHolder, cardExpiry, cardCvv) {
  return (
    validateCardNumber(cardNumber) &&
    validateCardHolder(cardHolder) &&
    validateCardExpiry(cardExpiry) &&
    validateCardCvv(cardCvv)
  );
}

function validateCardNumber(cardNumber) {
  // Remove spaces and check if it's all digits
  const cleanedNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleanedNumber)) return false;

  // Luhn algorithm for card validation
  let sum = 0;
  let isEven = false;

  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function validateCardHolder(cardHolder) {
  return (
    cardHolder && cardHolder.length >= 2 && /^[a-zA-Z\s]+$/.test(cardHolder)
  );
}

function validateCardExpiry(cardExpiry) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) return false;

  const [month, year] = cardExpiry.split("/");
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();

  return expiry > now;
}

function validateCardCvv(cardCvv) {
  return /^\d{3,4}$/.test(cardCvv);
}

function getCardType(cardNumber) {
  const cleanedNumber = cardNumber.replace(/\s/g, "");

  if (/^4/.test(cleanedNumber)) return "Visa";
  if (/^5[1-5]/.test(cleanedNumber)) return "MasterCard";
  if (/^3[47]/.test(cleanedNumber)) return "American Express";
  if (/^6(?:011|5)/.test(cleanedNumber)) return "Discover";

  return "Unknown";
}

async function processUPIPayment(orderData) {
  // Simulate UPI processing with proper error handling
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      try {
        if (Math.random() > 0.08) {
          resolve({
            success: true,
            transactionId:
              "UPI_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 9),
            method: "UPI",
            amount: orderData.totals.total,
            status: "completed",
          });
        } else {
          reject(
            new Error(
              "UPI payment failed. Please check your UPI ID and try again."
            )
          );
        }
      } catch (error) {
        reject(new Error("UPI processing error: " + error.message));
      }
    }, 3000);

    // Add timeout cleanup
    const cleanup = () => clearTimeout(timeoutId);
    resolve = ((originalResolve) => (value) => {
      cleanup();
      originalResolve(value);
    })(resolve);
    reject = ((originalReject) => (reason) => {
      cleanup();
      originalReject(reason);
    })(reject);
  });
}

async function processCODPayment(orderData) {
  // COD is always successful but pending
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId:
          "COD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        method: "Cash on Delivery",
        amount: orderData.totals.total,
        status: "pending_payment",
      });
    }, 500);
  });
}

// Cart and Order Functions
function validateCartItem(item) {
  return (
    item &&
    item.id &&
    item.name &&
    !isNaN(parseFloat(item.price)) &&
    isFinite(item.price) &&
    !isNaN(parseInt(item.quantity)) &&
    parseInt(item.quantity) > 0
  );
}

function displayEmptyCart(
  orderSummary,
  subtotalElement,
  shippingElement,
  totalElement,
  checkoutForm,
  submitButton
) {
  orderSummary.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 16px;"></i>
            <h3 style="color: var(--gray-600); margin-bottom: 8px;">Your cart is empty</h3>
            <p><a href="index.html" style="color: var(--primary-color); text-decoration: none;">Continue shopping</a></p>
        </div>
    `;
  subtotalElement.textContent = "0.00";
  shippingElement.textContent = "0.00";
  totalElement.textContent = "0.00";

  // Disable the checkout form
  if (checkoutForm) checkoutForm.style.opacity = "0.5";
  if (submitButton) submitButton.disabled = true;
}

function displayCartItems(validatedCart, orderSummary) {
  let subtotal = 0;
  orderSummary.innerHTML = "";

  validatedCart.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    const orderItem = document.createElement("div");
    orderItem.className = "order-item";
    orderItem.innerHTML = `
            <img src="${item.image}" 
                 alt="${item.name}" 
                 class="item-image"
                 onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'"
                 loading="lazy">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Qty: ${quantity}</div>
            </div>
            <div class="item-price">₹${itemTotal.toFixed(2)}</div>
        `;
    orderSummary.appendChild(orderItem);
  });

  return subtotal;
}

function updateOrderTotals(
  subtotal,
  subtotalElement,
  shippingElement,
  totalElement
) {
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over ₹50
  const total = subtotal + shipping;

  subtotalElement.textContent = subtotal.toFixed(2);
  shippingElement.textContent = shipping === 0 ? "0.00" : shipping.toFixed(2);
  totalElement.textContent = total.toFixed(2);

  return { subtotal, shipping, total };
}

// Payment Method Functions
function initializePaymentMethods() {
  const paymentMethods = document.querySelectorAll('input[name="payment"]');
  const upiDetails = document.getElementById("upi-details");
  const codDetails = document.getElementById("cod-details");
  const creditCardDetails = document.getElementById("credit-card-details");

  paymentMethods.forEach((method) => {
    method.addEventListener("change", (e) => {
      // Remove selected class from all payment methods
      document.querySelectorAll(".payment-method").forEach((pm) => {
        pm.classList.remove("selected");
      });

      // Add selected class to current method
      e.target.closest(".payment-method").classList.add("selected");

      // Show/hide relevant details
      if (upiDetails) upiDetails.classList.remove("active");
      if (codDetails) codDetails.classList.remove("active");
      if (creditCardDetails) creditCardDetails.classList.remove("active");

      if (e.target.value === "credit-card" && creditCardDetails) {
        creditCardDetails.classList.add("active");
      } else if (e.target.value === "upi" && upiDetails) {
        upiDetails.classList.add("active");
      } else if (e.target.value === "cod" && codDetails) {
        codDetails.classList.add("active");
      }
    });
  });

  // Initialize first payment method as selected
  if (paymentMethods.length > 0) {
    paymentMethods[0].closest(".payment-method").classList.add("selected");
    if (creditCardDetails) creditCardDetails.classList.add("active");
  }

  // Initialize credit card form validation
  initializeCreditCardValidation();
}

// Credit Card Validation Functions
function initializeCreditCardValidation() {
  const cardNumberInput = document.getElementById("card-number");
  const cardHolderInput = document.getElementById("card-holder");
  const cardExpiryInput = document.getElementById("card-expiry");
  const cardCvvInput = document.getElementById("card-cvv");
  const cardTypeIcon = document.getElementById("card-type-icon");

  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      // Format card number with spaces
      let value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
      let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
      if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19);
      }
      e.target.value = formattedValue;

      // Show card type icon
      const cardType = getCardType(value);
      if (cardTypeIcon) {
        cardTypeIcon.className = "card-type-icon";
        if (cardType !== "Unknown") {
          cardTypeIcon.classList.add(cardType.toLowerCase().replace(" ", ""));
          cardTypeIcon.innerHTML = `<i class="fab fa-cc-${cardType
            .toLowerCase()
            .replace(" ", "")}"></i>`;
        } else {
          cardTypeIcon.innerHTML = "";
        }
      }

      // Validate and show feedback
      if (value.length >= 13) {
        if (validateCardNumber(value)) {
          e.target.classList.remove("invalid");
          e.target.classList.add("valid");
        } else {
          e.target.classList.remove("valid");
          e.target.classList.add("invalid");
        }
      } else {
        e.target.classList.remove("valid", "invalid");
      }
    });
  }

  if (cardHolderInput) {
    cardHolderInput.addEventListener("input", (e) => {
      // Allow only letters and spaces
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

      if (e.target.value.length >= 2) {
        if (validateCardHolder(e.target.value)) {
          e.target.classList.remove("invalid");
          e.target.classList.add("valid");
        } else {
          e.target.classList.remove("valid");
          e.target.classList.add("invalid");
        }
      } else {
        e.target.classList.remove("valid", "invalid");
      }
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", (e) => {
      // Format MM/YY
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      e.target.value = value;

      if (value.length === 5) {
        if (validateCardExpiry(value)) {
          e.target.classList.remove("invalid");
          e.target.classList.add("valid");
        } else {
          e.target.classList.remove("valid");
          e.target.classList.add("invalid");
        }
      } else {
        e.target.classList.remove("valid", "invalid");
      }
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener("input", (e) => {
      // Allow only digits, max 4
      e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4);

      if (e.target.value.length >= 3) {
        if (validateCardCvv(e.target.value)) {
          e.target.classList.remove("invalid");
          e.target.classList.add("valid");
        } else {
          e.target.classList.remove("valid");
          e.target.classList.add("invalid");
        }
      } else {
        e.target.classList.remove("valid", "invalid");
      }
    });
  }
}

// Form Validation
function validateForm(formData) {
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim();
  const address = formData.get("address")?.trim();
  const paymentMethod = formData.get("payment");

  // Basic validation
  if (!name || name.length < 2) {
    throw new Error("Please enter a valid name (at least 2 characters)");
  }

  if (!email) {
    throw new Error("Please enter your email address");
  }

  // Enhanced email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  if (!address || address.length < 10) {
    throw new Error("Please enter a complete address (at least 10 characters)");
  }

  // Payment method specific validation
  if (paymentMethod === "credit-card") {
    const cardNumber = formData.get("card-number")?.replace(/\s/g, "");
    const cardHolder = formData.get("card-holder")?.trim();
    const cardExpiry = formData.get("card-expiry");
    const cardCvv = formData.get("card-cvv");

    if (!cardNumber || !validateCardNumber(cardNumber)) {
      throw new Error("Please enter a valid credit card number");
    }
    if (!cardHolder || !validateCardHolder(cardHolder)) {
      throw new Error("Please enter a valid cardholder name");
    }
    if (!cardExpiry || !validateCardExpiry(cardExpiry)) {
      throw new Error("Please enter a valid expiry date (MM/YY)");
    }
    if (!cardCvv || !validateCardCvv(cardCvv)) {
      throw new Error("Please enter a valid CVV");
    }
  } else if (paymentMethod === "upi") {
    const upiId = formData.get("upi-id")?.trim();
    if (!upiId || !upiId.includes("@") || upiId.length < 6) {
      throw new Error("Please enter a valid UPI ID (e.g., user@paytm)");
    }
  }

  return { name, email, address, paymentMethod };
}

// Form Submission Handler
function handleFormSubmission(
  checkoutForm,
  submitButton,
  orderMessage,
  validatedCart,
  totals
) {
  if (!checkoutForm) return;

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Check login status again
      if (!isUserLoggedIn()) {
        showLoginModal();
        return;
      }

      // Disable form during processing
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Processing...';

      const formData = new FormData(checkoutForm);
      const validatedFormData = validateForm(formData);

      // Create comprehensive order data
      const orderData = {
        orderId:
          "ORDER-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        customer: validatedFormData,
        items: validatedCart,
        paymentMethod: validatedFormData.paymentMethod,
        totals: {
          subtotal: parseFloat(totals.subtotal.toFixed(2)),
          shipping: parseFloat(totals.shipping.toFixed(2)),
          total: parseFloat(totals.total.toFixed(2)),
        },
        orderDate: new Date().toISOString(),
        status: "processing",
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        userId: getUserInfo().email,
      };

      // Show processing message
      if (orderMessage) {
        orderMessage.innerHTML = `
                    <div style="color: var(--primary-color); text-align: center; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: var(--border-radius); border: 1px solid var(--primary-color);">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px;"></i>
                        <h3 style="margin-bottom: 8px;">Processing Payment...</h3>
                        <p>Please wait while we process your ${validatedFormData.paymentMethod.replace(
                          "-",
                          " "
                        )} payment.</p>
                    </div>
                `;
      }

      // Process payment with timeout protection
      const paymentResult = await Promise.race([
        processPayment(orderData, validatedFormData.paymentMethod),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Payment processing timeout")),
            30000
          )
        ),
      ]);

      // Update order with payment info
      orderData.payment = paymentResult;
      orderData.status =
        paymentResult.status === "completed" ? "confirmed" : "pending_payment";

      // Store order data
      const existingOrders =
        JSON.parse(localStorage.getItem("orderHistory")) || [];
      existingOrders.push(orderData);
      localStorage.setItem("orderHistory", JSON.stringify(existingOrders));

      // Show success message
      if (orderMessage) {
        orderMessage.innerHTML = `
                    <div style="color: var(--success-color); text-align: center; padding: 20px; background: rgba(16, 185, 129, 0.1); border-radius: var(--border-radius); border: 1px solid var(--success-color);">
                        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 12px;"></i>
                        <h3 style="margin-bottom: 8px;">Order Confirmed!</h3>
                        <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                        <p><strong>Transaction ID:</strong> ${
                          paymentResult.transactionId
                        }</p>
                        <p><strong>Payment Method:</strong> ${
                          paymentResult.method
                        }</p>
                        <p><strong>Total:</strong> ₹${totals.total.toFixed(
                          2
                        )}</p>
                        <p style="margin-top: 12px;">Thank you for your order! Redirecting to home page...</p>
                    </div>
                `;
      }

      // Clear cart after successful order
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutCart");

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000);
    } catch (error) {
      console.error("Order processing error:", error);

      if (orderMessage) {
        orderMessage.innerHTML = `
                    <div style="color: var(--danger-color); text-align: center; padding: 16px; background: rgba(239, 68, 68, 0.1); border-radius: var(--border-radius); border: 1px solid var(--danger-color);">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                        ${error.message}
                    </div>
                `;
      }

      // Re-enable form
      submitButton.disabled = false;
      submitButton.innerHTML = "Place Order";
    }
  });
}

// Main Initialization Function
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    showLoginModal();
    // Disable the form
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.style.opacity = "0.5";
      checkoutForm.style.pointerEvents = "none";
    }
    return;
  }

  // Get user info and pre-fill form
  const userInfo = getUserInfo();
  const emailInput = document.getElementById("email");
  if (emailInput && userInfo.email) {
    emailInput.value = userInfo.email;
    emailInput.readOnly = true;
    emailInput.style.background = "var(--gray-100)";
  }

  // Get cart data from localStorage with enhanced error handling
  let checkoutCart = [];

  try {
    // Try to get from checkoutCart first, then regular cart
    checkoutCart =
      JSON.parse(localStorage.getItem("checkoutCart")) ||
      JSON.parse(localStorage.getItem("cart")) ||
      [];
  } catch (error) {
    console.error("Error parsing cart data:", error);
    checkoutCart = [];
  }

  // Get DOM elements with validation
  const orderSummary = document.getElementById("order-summary");
  const subtotalElement = document.getElementById("subtotal");
  const shippingElement = document.getElementById("shipping");
  const totalElement = document.getElementById("total");
  const checkoutForm = document.getElementById("checkout-form");
  const submitButton = document.getElementById("submit-order");
  const orderMessage = document.getElementById("order-message");

  // Check if critical elements exist
  if (!orderSummary || !subtotalElement || !shippingElement || !totalElement) {
    console.error("Required checkout elements not found");
    return;
  }

  // Clean and validate cart data
  const validatedCart = checkoutCart.filter(validateCartItem).map((item) => ({
    id: item.id,
    name: item.name || "Unknown Product",
    price: parseFloat(item.price) || 0,
    quantity: parseInt(item.quantity) || 1,
    image: item.image || "https://via.placeholder.com/60x60?text=No+Image",
    description: item.description || "",
  }));

  // Initialize cart display
  if (validatedCart.length === 0) {
    displayEmptyCart(
      orderSummary,
      subtotalElement,
      shippingElement,
      totalElement,
      checkoutForm,
      submitButton
    );
    return;
  }

  const subtotal = displayCartItems(validatedCart, orderSummary);
  const totals = updateOrderTotals(
    subtotal,
    subtotalElement,
    shippingElement,
    totalElement
  );

  // Initialize everything
  initializePaymentMethods();
  handleFormSubmission(
    checkoutForm,
    submitButton,
    orderMessage,
    validatedCart,
    totals
  );
});
