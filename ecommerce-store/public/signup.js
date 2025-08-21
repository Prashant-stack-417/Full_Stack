document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById(
    "signup-confirm-password"
  );
  const termsCheckbox = document.getElementById("terms-checkbox");
  const submitButton = document.getElementById("signup-submit");

  // Form submission handler
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput
      ? confirmPasswordInput.value.trim()
      : password;
    const termsAccepted = termsCheckbox ? termsCheckbox.checked : true;

    // Validation
    if (!validateForm(name, email, password, confirmPassword, termsAccepted)) {
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store auth token and user info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAdmin", data.user.isAdmin || false);

      // Show success message
      showMessage("Account created successfully! Redirecting...", "success");

      // Redirect to main page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      showMessage(
        error.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setLoadingState(false);
    }
  });

  // Real-time validation
  nameInput.addEventListener("blur", function () {
    const name = this.value.trim();
    if (name && name.length < 2) {
      showFieldError(this, "Name must be at least 2 characters long");
    } else {
      clearFieldError(this);
    }
  });

  emailInput.addEventListener("blur", function () {
    const email = this.value.trim();
    if (email && !isValidEmail(email)) {
      showFieldError(this, "Please enter a valid email address");
    } else {
      clearFieldError(this);
    }
  });

  passwordInput.addEventListener("input", function () {
    const password = this.value;
    updatePasswordStrength(password);

    // Clear confirm password error if passwords now match
    if (confirmPasswordInput && confirmPasswordInput.value) {
      if (password === confirmPasswordInput.value) {
        clearFieldError(confirmPasswordInput);
      }
    }
  });

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("blur", function () {
      const password = passwordInput.value;
      const confirmPassword = this.value;

      if (confirmPassword && password !== confirmPassword) {
        showFieldError(this, "Passwords do not match");
      } else {
        clearFieldError(this);
      }
    });
  }

  // Add password toggle functionality
  addPasswordToggle(passwordInput);
  if (confirmPasswordInput) {
    addPasswordToggle(confirmPasswordInput);
  }

  // Add password strength indicator
  addPasswordStrengthIndicator();

  // Validation functions
  function validateForm(name, email, password, confirmPassword, termsAccepted) {
    let isValid = true;

    // Clear all previous errors
    clearAllFieldErrors();

    // Name validation
    if (!name) {
      showFieldError(nameInput, "Name is required");
      isValid = false;
    } else if (name.length < 2) {
      showFieldError(nameInput, "Name must be at least 2 characters long");
      isValid = false;
    }

    // Email validation
    if (!email) {
      showFieldError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (!password) {
      showFieldError(passwordInput, "Password is required");
      isValid = false;
    } else if (password.length < 6) {
      showFieldError(
        passwordInput,
        "Password must be at least 6 characters long"
      );
      isValid = false;
    }

    // Confirm password validation
    if (confirmPasswordInput && password !== confirmPassword) {
      showFieldError(confirmPasswordInput, "Passwords do not match");
      isValid = false;
    }

    // Terms validation
    if (!termsAccepted) {
      showMessage("Please accept the terms and conditions", "error");
      isValid = false;
    }

    return isValid;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById("password-strength");
    const strengthBars = document.querySelectorAll(".strength-bar");
    const requirements = document.querySelectorAll(".requirement-icon");

    if (!strengthIndicator) return;

    // Calculate strength
    let strength = 0;
    const checks = [
      password.length >= 6,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    checks.forEach((check, index) => {
      if (check) strength++;
      if (requirements[index]) {
        requirements[index].classList.toggle("met", check);
      }
    });

    // Update strength bars
    strengthBars.forEach((bar, index) => {
      bar.className = "strength-bar";
      if (index < Math.ceil(strength / 2)) {
        if (strength <= 2) bar.classList.add("weak");
        else if (strength <= 4) bar.classList.add("medium");
        else bar.classList.add("strong");
      }
    });
  }

  function setLoadingState(loading) {
    if (loading) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      submitButton.classList.add("loading");
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML =
        '<i class="fas fa-user-plus"></i> Create Account';
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

  function clearAllFieldErrors() {
    const allErrors = document.querySelectorAll(".field-error");
    allErrors.forEach((error) => error.remove());

    const allInputs = [nameInput, emailInput, passwordInput];
    if (confirmPasswordInput) allInputs.push(confirmPasswordInput);

    allInputs.forEach((input) => {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    });
  }

  function addPasswordToggle(passwordField) {
    const container = passwordField.parentNode;
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
      const isPassword = passwordField.type === "password";
      passwordField.type = isPassword ? "text" : "password";
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

    container.appendChild(toggleButton);
  }

  function addPasswordStrengthIndicator() {
    const passwordGroup = passwordInput.closest(".form-group");

    // Add strength indicator
    const strengthDiv = document.createElement("div");
    strengthDiv.id = "password-strength";
    strengthDiv.className = "password-strength";
    strengthDiv.innerHTML = `
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
        `;

    // Add requirements list
    const requirementsDiv = document.createElement("div");
    requirementsDiv.className = "password-requirements";
    requirementsDiv.innerHTML = `
            <ul>
                <li><span class="requirement-icon"></span> At least 6 characters</li>
            </ul>
        `;

    passwordGroup.appendChild(strengthDiv);
    passwordGroup.appendChild(requirementsDiv);
  }

  // Check if user is already logged in
  if (localStorage.getItem("authToken")) {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    window.location.href = isAdmin ? "admin.html" : "index.html";
  }
});
