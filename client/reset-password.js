
document.addEventListener('DOMContentLoaded', function() {
  // Get all DOM elements
  const FORM = document.getElementById('resetForm');
  const NEW_PASSWORD_INPUT = document.getElementById('newPassword');
  const CONFIRM_PASSWORD_INPUT = document.getElementById('confirmPassword');
  const RESET_TOKEN_INPUT = document.getElementById('resetToken');
  const MESSAGE_AREA = document.getElementById('messageArea');
  const SUBMIT_BUTTON = document.getElementById('submitButton');
  const BUTTON_TEXT = document.getElementById('buttonText');
  const SPINNER = document.getElementById('spinner');

//   const RESET_PASSWORD_ENDPOINT = "http://localhost:3000/api/auth/reset-password";
  const RESET_PASSWORD_ENDPOINT = "https://shippingsite.onrender.com/api/auth/reset-password";

  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Set the token in the hidden input field
  if (token) {
    RESET_TOKEN_INPUT.value = token;
  } else {
    displayMessage("Invalid or missing reset token. Please request a new password reset link.", false);
    FORM.style.display = 'none';
  }

  // Function to show and hide loading state
  function setLoading(isLoading) {
    SUBMIT_BUTTON.disabled = isLoading;
    if (isLoading) {
      BUTTON_TEXT.textContent = 'Resetting...';
      SPINNER.style.display = 'inline-block';
    } else {
      BUTTON_TEXT.textContent = 'Reset Password';
      SPINNER.style.display = 'none';
    }
  }

  // Function to display messages to the user
  function displayMessage(message, isSuccess = true) {
    MESSAGE_AREA.textContent = message;
    MESSAGE_AREA.className = 'message-area';
    
    if (isSuccess) {
      MESSAGE_AREA.classList.add('message-success');
    } else {
      MESSAGE_AREA.classList.add('message-error');
    }
    
    MESSAGE_AREA.style.display = 'block';
  }

  // Validate password match
  function validatePasswords() {
    const newPassword = NEW_PASSWORD_INPUT.value;
    const confirmPassword = CONFIRM_PASSWORD_INPUT.value;
    
    if (newPassword !== confirmPassword) {
      displayMessage("Passwords do not match.", false);
      return false;
    }
    
    if (newPassword.length < 6) {
      displayMessage("Password must be at least 6 characters long.", false);
      return false;
    }
    
    return true;
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    
    // Clear previous messages
    MESSAGE_AREA.style.display = 'none';

    // Validate passwords
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    const formData = {
      token: RESET_TOKEN_INPUT.value,
      newPassword: NEW_PASSWORD_INPUT.value
    };

    try {
      const response = await fetch(RESET_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        displayMessage(result.message || "Password has been reset successfully!", true);
        FORM.reset();
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        displayMessage(result.message || "An error occurred while resetting your password.", false);
      }

    } catch (error) {
      console.error("Password Reset Error:", error);
      displayMessage("Network error: Could not reach the server. Please check your connection.", false);
    } finally {
      setLoading(false);
    }
  }

  // Real-time password validation
  CONFIRM_PASSWORD_INPUT.addEventListener('input', function() {
    const newPassword = NEW_PASSWORD_INPUT.value;
    const confirmPassword = CONFIRM_PASSWORD_INPUT.value;
    
    if (confirmPassword && newPassword !== confirmPassword) {
      CONFIRM_PASSWORD_INPUT.style.borderColor = '#dc2626';
    } else if (confirmPassword && newPassword === confirmPassword) {
      CONFIRM_PASSWORD_INPUT.style.borderColor = '#10b981';
    } else {
      CONFIRM_PASSWORD_INPUT.style.borderColor = '#d1d5db';
    }
  });

  FORM.addEventListener('submit', handlePasswordReset);
});