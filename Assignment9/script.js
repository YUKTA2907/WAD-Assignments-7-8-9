/**
 * IPL Ticket Booking Portal - Client-Side Validation & Booking History Script (Assignment 9)
 *
 * Implements:
 * - Full client-side form validation (Name, Email, 10-digit Phone, Match, Category, 1-10 Tickets)
 * - Event listeners for submit, input, change, click
 * - preventDefault() on submit
 * - Dynamic error clearing and field highlighting (.input-error / .input-valid)
 * - Live receipt calculations and summary updates
 * - Loading spinner animation & duplicate-submission prevention
 * - LocalStorage-backed Booking History & Statistics (Total Bookings, Total Tickets, Category Breakdown)
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
  const categorySelect = document.getElementById("category");
  const ticketsInput = document.getElementById("tickets");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const matchError = document.getElementById("matchError");
  const categoryError = document.getElementById("categoryError");
  const ticketsError = document.getElementById("ticketsError");

  const loadingIndicator = document.getElementById("loading");
  const successMessage = document.getElementById("successMessage");

  // Summary Elements
  const summaryName = document.getElementById("summaryName");
  const summaryEmail = document.getElementById("summaryEmail");
  const summaryPhone = document.getElementById("summaryPhone");
  const summaryMatch = document.getElementById("summaryMatch");
  const summaryCategory = document.getElementById("summaryCategory");
  const summaryUnitPrice = document.getElementById("summaryUnitPrice");
  const summaryTickets = document.getElementById("summaryTickets");
  const totalAmount = document.getElementById("total");
  const summaryStatus = document.getElementById("summaryStatus");
  const summaryRef = document.getElementById("summaryRef");
  const refRow = document.getElementById("refRow");

  // Booking History Elements
  const statTotalBookings = document.getElementById("statTotalBookings");
  const statTotalTickets = document.getElementById("statTotalTickets");
  const statGeneralBookings = document.getElementById("statGeneralBookings");
  const statPremiumBookings = document.getElementById("statPremiumBookings");
  const statVipBookings = document.getElementById("statVipBookings");
  const historyTableBody = document.getElementById("historyTableBody");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  // Pricing configuration
  const CATEGORY_PRICES = {
    "General": 1000,
    "Premium": 2500,
    "VIP": 5000
  };

  const STORAGE_KEY = "ipl_booking_history";

  // -------------------------------------------------------------------------
  // 2. Individual Field Validation Functions
  // -------------------------------------------------------------------------

  /**
   * Validate Full Name
   * - Cannot be empty or whitespace only
   * - Must contain only letters and spaces (2 to 50 characters)
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
   * - Must match user@domain.tld format
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
   * - Exactly 10 numeric digits
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
   * - Must choose an upcoming match option
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
   * Validate Ticket Category
   * - General, Premium, or VIP
   */
  function validateCategory() {
    const value = categorySelect.value;
    if (!value || !CATEGORY_PRICES[value]) {
      showError(categorySelect, categoryError, "Please select a valid ticket category.");
      return false;
    } else {
      clearError(categorySelect, categoryError);
      return true;
    }
  }

  /**
   * Validate Number of Tickets
   * - Valid integer between 1 and 10
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
  // 3. Helper Functions: Error Display & Reset
  // -------------------------------------------------------------------------

  function showError(inputElement, errorElement, message) {
    if (errorElement) errorElement.textContent = message;
    if (inputElement) {
      inputElement.classList.add("input-error");
      inputElement.classList.remove("input-valid");
    }
  }

  function clearError(inputElement, errorElement) {
    if (errorElement) errorElement.textContent = "";
    if (inputElement) {
      inputElement.classList.remove("input-error");
      inputElement.classList.add("input-valid");
    }
  }

  function resetAllErrors() {
    const errorElements = [nameError, emailError, phoneError, matchError, categoryError, ticketsError];
    const inputElements = [nameInput, emailInput, phoneInput, matchSelect, categorySelect, ticketsInput];

    errorElements.forEach(function (el) {
      if (el) el.textContent = "";
    });

    inputElements.forEach(function (el) {
      if (el) {
        el.classList.remove("input-error");
        el.classList.remove("input-valid");
      }
    });

    successMessage.style.display = "none";
    loadingIndicator.style.display = "none";
  }

  function updateLiveTotal() {
    const selectedCategory = categorySelect.value || "General";
    const unitPrice = CATEGORY_PRICES[selectedCategory] || 1000;
    const count = parseInt(ticketsInput.value, 10);

    summaryCategory.textContent = selectedCategory + " Stand";
    summaryUnitPrice.textContent = "₹" + unitPrice.toLocaleString("en-IN");

    if (!isNaN(count) && count >= 1 && count <= 10) {
      summaryTickets.textContent = count;
      totalAmount.textContent = (count * unitPrice).toLocaleString("en-IN");
    } else {
      summaryTickets.textContent = "0";
      totalAmount.textContent = "0";
    }
  }

  // -------------------------------------------------------------------------
  // 4. Real-Time Listeners
  // -------------------------------------------------------------------------

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

  categorySelect.addEventListener("change", function () {
    validateCategory();
    updateLiveTotal();
  });

  ticketsInput.addEventListener("input", function () {
    if (ticketsInput.classList.contains("input-error") || ticketsInput.value.trim() !== "") {
      validateTickets();
    }
    updateLiveTotal();
  });

  // -------------------------------------------------------------------------
  // 5. Reset Form Handler
  // -------------------------------------------------------------------------
  resetBtn.addEventListener("click", function () {
    form.reset();
    resetAllErrors();

    summaryName.textContent = "Not provided";
    summaryEmail.textContent = "Not provided";
    summaryPhone.textContent = "Not provided";
    summaryMatch.textContent = "None selected";
    summaryCategory.textContent = "General Stand";
    summaryUnitPrice.textContent = "₹1,000";
    summaryTickets.textContent = "0";
    totalAmount.textContent = "0";
    summaryStatus.textContent = "Awaiting Submission";
    summaryStatus.className = "status-tag status-pending";
    refRow.style.display = "none";
  });

  // -------------------------------------------------------------------------
  // 6. Booking History & Statistics (localStorage backed)
  // -------------------------------------------------------------------------

  /**
   * Retrieve stored bookings from browser localStorage
   */
  function getStoredBookings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return [];
    }
  }

  /**
   * Save bookings array to browser localStorage
   */
  function saveStoredBookings(bookings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }

  /**
   * Render statistics summary cards and table rows from actual stored bookings
   */
  function renderBookingHistory() {
    const bookings = getStoredBookings();

    // 1. Calculate genuine statistics
    const totalBookings = bookings.length;
    const totalTickets = bookings.reduce(function (sum, item) {
      return sum + (parseInt(item.tickets, 10) || 0);
    }, 0);
    const generalCount = bookings.filter(function (item) {
      return item.category === "General";
    }).length;
    const premiumCount = bookings.filter(function (item) {
      return item.category === "Premium";
    }).length;
    const vipCount = bookings.filter(function (item) {
      return item.category === "VIP";
    }).length;

    // 2. Update Statistics DOM Elements
    if (statTotalBookings) statTotalBookings.textContent = totalBookings;
    if (statTotalTickets) statTotalTickets.textContent = totalTickets;
    if (statGeneralBookings) statGeneralBookings.textContent = generalCount;
    if (statPremiumBookings) statPremiumBookings.textContent = premiumCount;
    if (statVipBookings) statVipBookings.textContent = vipCount;

    // 3. Render Table Rows
    if (!historyTableBody) return;

    if (bookings.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-history">
            No booking records found in this browser. Fill in the form above and submit to record your first booking!
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = "";
    bookings.forEach(function (b) {
      const categoryClass = b.category.toLowerCase();
      rowsHtml += `
        <tr>
          <td><span class="booking-ref-code">${b.id}</span></td>
          <td><strong>${escapeHtml(b.customer)}</strong></td>
          <td>${escapeHtml(b.match)}</td>
          <td><span class="badge-category badge-${categoryClass}">${escapeHtml(b.category)}</span></td>
          <td><strong>${b.tickets}</strong></td>
          <td>₹${Number(b.total).toLocaleString("en-IN")}</td>
          <td><small>${b.date}</small></td>
          <td><span class="status-tag status-confirmed">${escapeHtml(b.status)}</span></td>
        </tr>
      `;
    });

    historyTableBody.innerHTML = rowsHtml;
  }

  /**
   * Add a newly completed booking to localStorage and refresh view
   */
  function addBookingToHistory(booking) {
    const bookings = getStoredBookings();
    bookings.unshift(booking); // add to beginning
    saveStoredBookings(bookings);
    renderBookingHistory();
  }

  /**
   * Helper to escape HTML characters
   */
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Clear History handler
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear your local booking history?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderBookingHistory();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. Form Submission Handler
  // -------------------------------------------------------------------------
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Run all validations
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isMatchValid = validateMatch();
    const isCategoryValid = validateCategory();
    const isTicketsValid = validateTickets();

    const isFormValid =
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isMatchValid &&
      isCategoryValid &&
      isTicketsValid;

    // If validation fails, focus the first invalid field and stop
    if (!isFormValid) {
      const firstInvalid = document.querySelector(".input-error");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Capture validated attendee & ticket values
    const attendeeName = nameInput.value.trim();
    const attendeeEmail = emailInput.value.trim();
    const attendeePhone = phoneInput.value.trim();
    const selectedMatch = matchSelect.value;
    const selectedCategory = categorySelect.value;
    const unitPrice = CATEGORY_PRICES[selectedCategory] || 1000;
    const ticketCount = parseInt(ticketsInput.value, 10);
    const calculatedTotal = ticketCount * unitPrice;

    // 1. Update Booking Summary values
    summaryName.textContent = attendeeName;
    summaryEmail.textContent = attendeeEmail;
    summaryPhone.textContent = attendeePhone;
    summaryMatch.textContent = selectedMatch;
    summaryCategory.textContent = selectedCategory + " Stand";
    summaryUnitPrice.textContent = "₹" + unitPrice.toLocaleString("en-IN");
    summaryTickets.textContent = ticketCount;
    totalAmount.textContent = calculatedTotal.toLocaleString("en-IN");

    // 2. Prevent duplicate submissions while processing
    submitBtn.disabled = true;
    resetBtn.disabled = true;
    submitBtn.textContent = "Processing Order...";

    // 3. Show loading animation
    successMessage.style.display = "none";
    loadingIndicator.style.display = "block";
    summaryStatus.textContent = "Processing...";
    summaryStatus.className = "status-tag status-pending";

    // 4. Simulate asynchronous processing (1.5 seconds)
    setTimeout(function () {
      loadingIndicator.style.display = "none";
      successMessage.style.display = "block";

      summaryStatus.textContent = "Confirmed ✅";
      summaryStatus.className = "status-tag status-confirmed";

      // Generate unique booking ID
      const randomRef = "IPL-2027-" + Math.floor(100000 + Math.random() * 900000);
      summaryRef.textContent = randomRef;
      refRow.style.display = "flex";

      // Format current timestamp
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) + ", " + now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      });

      // Add to genuine Booking History
      const newBookingRecord = {
        id: randomRef,
        customer: attendeeName,
        email: attendeeEmail,
        phone: attendeePhone,
        match: selectedMatch,
        category: selectedCategory,
        tickets: ticketCount,
        total: calculatedTotal,
        date: formattedDate,
        status: "Confirmed ✅"
      };

      addBookingToHistory(newBookingRecord);

      // Re-enable form buttons
      submitBtn.disabled = false;
      resetBtn.disabled = false;
      submitBtn.textContent = "Confirm & Book Tickets";

      // Smooth scroll to history row
      successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 1500);
  });

  // -------------------------------------------------------------------------
  // 8. Initial Load: Populate Booking History from localStorage
  // -------------------------------------------------------------------------
  renderBookingHistory();
});
