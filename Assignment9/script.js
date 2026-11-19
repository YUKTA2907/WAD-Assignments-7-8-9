/**
 * IPL Ticket Booking Portal - Client-Side Validation Script (Assignment 9)
 *
 * Implements full client-side validation using standard JavaScript DOM APIs:
 * - addEventListener for submit, input, change and click events
 * - preventDefault() to control submission flow
 * - Dynamic error messaging and field highlighting
 * - Live receipt calculation and summary updates
 * - Simulated asynchronous processing with duplicate-submission protection
 */

document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------------------------
  // 1. Element References
  // -------------------------------------------------------------------------
  const form = document.getElementById("bookingForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const matchSelect = document.getElementById("match");
  const ticketsInput = document.getElementById("tickets");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const matchError = document.getElementById("matchError");
  const ticketsError = document.getElementById("ticketsError");

  const loadingIndicator = document.getElementById("loading");
  const successMessage = document.getElementById("successMessage");

  // Summary Elements
  const summaryName = document.getElementById("summaryName");
  const summaryEmail = document.getElementById("summaryEmail");
  const summaryPhone = document.getElementById("summaryPhone");
  const summaryMatch = document.getElementById("summaryMatch");
  const summaryTickets = document.getElementById("summaryTickets");
  const totalAmount = document.getElementById("total");
  const summaryStatus = document.getElementById("summaryStatus");
  const summaryRef = document.getElementById("summaryRef");
  const refRow = document.getElementById("refRow");

  const TICKET_PRICE = 1000;

  // -------------------------------------------------------------------------
  // 2. Individual Field Validation Functions
  // -------------------------------------------------------------------------

  /**
   * Validate Full Name
   * - Cannot be empty or contain only whitespace
   * - Must contain only alphabetic characters and spaces
   * - Minimum 2 characters, maximum 50 characters
   */
  function validateName() {
    const value = nameInput.value.trim();
    const nameRegex = /^[A-Za-z\s]{2,50}$/;

    if (value === "") {
      showError(nameInput, nameError, "Full Name is required and cannot be blank.");
      return false;
    } else if (!nameRegex.test(value)) {
      showError(
        nameInput,
        nameError,
        "Please enter a valid name (letters only, at least 2 characters)."
      );
      return false;
    } else {
      clearError(nameInput, nameError);
      return true;
    }
  }

  /**
   * Validate Email Address
   * - Cannot be empty
   * - Must match standard email pattern: user@domain.tld
   */
  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      showError(emailInput, emailError, "Email Address is required.");
      return false;
    } else if (!emailRegex.test(value)) {
      showError(
        emailInput,
        emailError,
        "Please enter a valid email address (e.g., name@domain.com)."
      );
      return false;
    } else {
      clearError(emailInput, emailError);
      return true;
    }
  }

  /**
   * Validate Phone Number
   * - Cannot be empty
   * - Must contain exactly 10 numeric digits
   */
  function validatePhone() {
    const value = phoneInput.value.trim();
    const phoneRegex = /^[0-9]{10}$/;

    if (value === "") {
      showError(phoneInput, phoneError, "Phone Number is required.");
      return false;
    } else if (!phoneRegex.test(value)) {
      showError(
        phoneInput,
        phoneError,
        "Please enter a valid 10-digit mobile number."
      );
      return false;
    } else {
      clearError(phoneInput, phoneError);
      return true;
    }
  }

  /**
   * Validate Match Selection
   * - User must select a valid non-empty match option
   */
  function validateMatch() {
    const value = matchSelect.value;

    if (value === "") {
      showError(matchSelect, matchError, "Please select an upcoming match.");
      return false;
    } else {
      clearError(matchSelect, matchError);
      return true;
    }
  }

  /**
   * Validate Number of Tickets
   * - Must be a valid integer
   * - Minimum 1 ticket, maximum 10 tickets
   */
  function validateTickets() {
    const value = ticketsInput.value.trim();
    const numericRegex = /^\d+$/;

    if (value === "") {
      showError(ticketsInput, ticketsError, "Ticket quantity is required.");
      return false;
    } else if (!numericRegex.test(value)) {
      showError(
        ticketsInput,
        ticketsError,
        "Please enter a valid numeric value."
      );
      return false;
    } else {
      const count = parseInt(value, 10);
      if (count < 1 || count > 10) {
        showError(
          ticketsInput,
          ticketsError,
          "You can only book between 1 and 10 tickets per order."
        );
        return false;
      } else {
        clearError(ticketsInput, ticketsError);
        return true;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Helper Functions: Error Display & State Management
  // -------------------------------------------------------------------------

  function showError(inputElement, errorElement, message) {
    errorElement.textContent = message;
    inputElement.classList.add("input-error");
    inputElement.classList.remove("input-valid");
  }

  function clearError(inputElement, errorElement) {
    errorElement.textContent = "";
    inputElement.classList.remove("input-error");
    inputElement.classList.add("input-valid");
  }

  function resetAllErrors() {
    const errorElements = [nameError, emailError, phoneError, matchError, ticketsError];
    const inputElements = [nameInput, emailInput, phoneInput, matchSelect, ticketsInput];

    errorElements.forEach(function (el) {
      el.textContent = "";
    });

    inputElements.forEach(function (el) {
      el.classList.remove("input-error");
      el.classList.remove("input-valid");
    });

    successMessage.style.display = "none";
    loadingIndicator.style.display = "none";
  }

  // -------------------------------------------------------------------------
  // 4. Real-Time Validation & Live Summary Updates
  // -------------------------------------------------------------------------

  // Validate and remove errors as soon as the user types or corrects input
  nameInput.addEventListener("input", function () {
    if (nameInput.classList.contains("input-error") || nameInput.value.trim() !== "") {
      validateName();
    }
    summaryName.textContent = nameInput.value.trim() || "Not provided";
  });

  emailInput.addEventListener("input", function () {
    if (emailInput.classList.contains("input-error") || emailInput.value.trim() !== "") {
      validateEmail();
    }
    summaryEmail.textContent = emailInput.value.trim() || "Not provided";
  });

  phoneInput.addEventListener("input", function () {
    // Restrict input to digits only
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    if (phoneInput.classList.contains("input-error") || phoneInput.value.trim() !== "") {
      validatePhone();
    }
    summaryPhone.textContent = phoneInput.value.trim() || "Not provided";
  });

  matchSelect.addEventListener("change", function () {
    validateMatch();
    summaryMatch.textContent = matchSelect.value || "None selected";
  });

  ticketsInput.addEventListener("input", function () {
    if (ticketsInput.classList.contains("input-error") || ticketsInput.value.trim() !== "") {
      validateTickets();
    }
    const count = parseInt(ticketsInput.value, 10);
    if (!isNaN(count) && count >= 1 && count <= 10) {
      summaryTickets.textContent = count;
      totalAmount.textContent = (count * TICKET_PRICE).toLocaleString("en-IN");
    } else {
      summaryTickets.textContent = "0";
      totalAmount.textContent = "0";
    }
  });

  // -------------------------------------------------------------------------
  // 5. Reset Form Handler
  // -------------------------------------------------------------------------
  resetBtn.addEventListener("click", function () {
    form.reset();
    resetAllErrors();

    // Reset summary to default states
    summaryName.textContent = "Not provided";
    summaryEmail.textContent = "Not provided";
    summaryPhone.textContent = "Not provided";
    summaryMatch.textContent = "None selected";
    summaryTickets.textContent = "0";
    totalAmount.textContent = "0";
    summaryStatus.textContent = "Awaiting Submission";
    summaryStatus.className = "status-tag status-pending";
    refRow.style.display = "none";
  });

  // -------------------------------------------------------------------------
  // 6. Form Submission Handler
  // -------------------------------------------------------------------------
  form.addEventListener("submit", function (event) {
    // Prevent default browser submission
    event.preventDefault();

    // Run all validations
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isMatchValid = validateMatch();
    const isTicketsValid = validateTickets();

    const isFormValid =
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isMatchValid &&
      isTicketsValid;

    // If validation fails, focus the first invalid field and stop
    if (!isFormValid) {
      const firstInvalid = document.querySelector(".input-error");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // -----------------------------------------------------------------------
    // Successful Validation Flow
    // -----------------------------------------------------------------------
    const attendeeName = nameInput.value.trim();
    const attendeeEmail = emailInput.value.trim();
    const attendeePhone = phoneInput.value.trim();
    const selectedMatch = matchSelect.value;
    const ticketCount = parseInt(ticketsInput.value, 10);
    const calculatedTotal = ticketCount * TICKET_PRICE;

    // 1. Update Booking Summary values
    summaryName.textContent = attendeeName;
    summaryEmail.textContent = attendeeEmail;
    summaryPhone.textContent = attendeePhone;
    summaryMatch.textContent = selectedMatch;
    summaryTickets.textContent = ticketCount;
    totalAmount.textContent = calculatedTotal.toLocaleString("en-IN");

    // 2. Prevent duplicate submissions while processing
    submitBtn.disabled = true;
    resetBtn.disabled = true;
    submitBtn.textContent = "Processing Order...";

    // 3. Hide previous success message and show loading animation
    successMessage.style.display = "none";
    loadingIndicator.style.display = "block";
    summaryStatus.textContent = "Processing...";
    summaryStatus.className = "status-tag status-pending";

    // 4. Simulate asynchronous processing (1.5 seconds)
    setTimeout(function () {
      // Hide loading animation
      loadingIndicator.style.display = "none";

      // Display successful submission message
      successMessage.style.display = "block";

      // Update Booking Summary confirmation status
      summaryStatus.textContent = "Confirmed ✅";
      summaryStatus.className = "status-tag status-confirmed";

      // Generate booking reference code
      const randomRef = "IPL-2027-" + Math.floor(100000 + Math.random() * 900000);
      summaryRef.textContent = randomRef;
      refRow.style.display = "flex";

      // Re-enable form buttons
      submitBtn.disabled = false;
      resetBtn.disabled = false;
      submitBtn.textContent = "Confirm & Book Tickets";

      // Scroll smoothly to success message if needed
      successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 1500);
  });
});
