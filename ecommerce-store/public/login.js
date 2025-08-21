document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const submitButton = document.getElementById("login-submit");

  // Form submission handler
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic validation
    if (!email || !password) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address", "error");
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store auth token and user info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAdmin", data.user.isAdmin || false);

      // Show success message
      showMessage("Login successful! Redirecting...", "success");

      // Check for redirect URL
      const redirectUrl =
        localStorage.getItem("redirectAfterLogin") || "index.html";
      localStorage.removeItem("redirectAfterLogin");

      // Redirect based on user role or saved redirect
      setTimeout(() => {
        if (data.user.isAdmin) {
          window.location.href = "admin.html";
        } else {
          window.location.href = redirectUrl;
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      showMessage(error.message || "Login failed. Please try again.", "error");
    } finally {
      setLoadingState(false);
    }
  });

  // Real-time email validation
  emailInput.addEventListener("blur", function () {
    const email = this.value.trim();
    if (email && !isValidEmail(email)) {
      showFieldError(this, "Please enter a valid email address");
    } else {
      clearFieldError(this);
    }
  });

  // Password visibility toggle
  addPasswordToggle();

  // Helper functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function setLoadingState(loading) {
    if (loading) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      submitButton.classList.add("loading");
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      submitButton.classList.remove("loading");
    }
  }

  function showMessage(message, type) {
    const errorElement = document.getElementById("error-message");
    const successElement = document.getElementById("success-message");

    // Hide both messages first
    errorElement.style.display = "none";
    successElement.style.display = "none";

    // Show appropriate message
    if (type === "error") {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        errorElement.style.display = "none";
      }, 5000);
    } else if (type === "success") {
      successElement.textContent = message;
      successElement.style.display = "block";
    }
  }

  function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = "var(--danger-color)";
    field.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";

    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            color: var(--danger-color);
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  function clearFieldError(field) {
    field.style.borderColor = "";
    field.style.boxShadow = "";

    const errorDiv = field.parentNode.querySelector(".field-error");
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  function addPasswordToggle() {
    const passwordContainer = passwordInput.parentNode;
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "password-toggle";
    toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    toggleButton.style.cssText = `
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--gray-400);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: var(--border-radius-sm);
            transition: color 0.3s ease;
            z-index: 3;
        `;

    toggleButton.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleButton.innerHTML = isPassword
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
    });

    toggleButton.addEventListener("mouseenter", function () {
      this.style.color = "var(--primary-color)";
    });

    toggleButton.addEventListener("mouseleave", function () {
      this.style.color = "var(--gray-400)";
    });

    passwordContainer.appendChild(toggleButton);
  }

  // Check if user is already logged in
  if (localStorage.getItem("authToken")) {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    window.location.href = isAdmin ? "admin.html" : "index.html";
  }
});
