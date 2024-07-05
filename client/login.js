const loginBtn = (event) => {
    event.preventDefault();
    let url = "http://localhost:4000/login";
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const showError = document.getElementById("showError");
    const showErr = document.getElementById("showErr");

    if (email === '' || password === '' ) {
      showError.textContent = 'Both fields are required';
      showError.style.display = 'block';
  
      return; // Return from the function to prevent further execution
  
  }
  
  
    const data = {
      email,
      password,
    };
  
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
        return res.json().then(err => {
          throw err;
        });
      }
      return res.json();
    })
      .then((data) => {
        if (data.token) {
          // Save the token to localStorage
          localStorage.setItem("authToken", data.token);
        //   console.log("Token saved to localStorage:", data.token);
        }
        // console.log("Signin Successful", data);
        // alert("Signin successful!");
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.errorType === "unverified") {
          showError.textContent = "Your email is not verified. Please check your email for a verification link.";
        } else if (error.errorType === "invalidPassword") {
          showError.textContent = "Invalid password. Please try again.";
        } else {
          showError.textContent = error.message || "An error occurred during login.";
        }
        showError.style.display = 'block';
      });
  };

  

