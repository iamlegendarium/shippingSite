const FORM = document.getElementById("resetForm");
const EMAIL_INPUT = document.getElementById("email");
const MESSAGE_AREA = document.getElementById("messageArea");
const SUBMIT_BUTTON = document.getElementById("submitButton");
const BUTTON_TEXT = document.getElementById("buttonText");
const SPINNER = document.getElementById("spinner");

// const API_ENDPOINT = "http://localhost:3000/api/auth/forgot-password";
const API_ENDPOINT = "https://shippingsite.onrender.com/api/auth/forgot-password";

// Function to show and hide loading state
const setLoading = (isLoading) => {
  SUBMIT_BUTTON.disabled = isLoading;
  if (isLoading) {
    BUTTON_TEXT.textContent = "Sending...";
    SPINNER.style.display = "inline-block";
  } else {
    BUTTON_TEXT.textContent = "Send password reset link";
    SPINNER.style.display = "none";
  }
};

// Function to display messages to the user
const displayMessage = (message, isSuccess = true) => {
  MESSAGE_AREA.textContent = message;
  MESSAGE_AREA.className = "message-area";

  if (isSuccess) {
    MESSAGE_AREA.classList.add("message-success");
  } else {
    MESSAGE_AREA.classList.add("message-error");
  }

  MESSAGE_AREA.style.display = "block";
};

const handlePasswordReset = async (event) => {
  event.preventDefault();
  setLoading(true);
  MESSAGE_AREA.style.display = "none"; // Clear previous messages

  const email = EMAIL_INPUT.value.trim();
  if (!email) {
    displayMessage("Please enter a valid email address.", false);
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      displayMessage(result.message, true);
      FORM.reset();
    } else {
      displayMessage(
        result.message || "An error occurred. Please try again.",
        false
      );
    }
  } catch (error) {
    console.error("Password Reset Error:", error);
    displayMessage(
      "Network error: Could not reach the server. Please check your connection.",
      false
    );
  } finally {
    setLoading(false);
  }
};

FORM.addEventListener("submit", handlePasswordReset);
