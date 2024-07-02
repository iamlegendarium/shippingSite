const loginBtn = (event) => {
    event.preventDefault();
    let url = "http://localhost:4000/login";
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
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
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          // Save the token to localStorage
          localStorage.setItem("authToken", data.token);
          console.log("Token saved to localStorage:", data.token);
        }
        console.log("Signin Successful", data);
        alert("Signin successful!");
        // Optionally, redirect the user to a dashboard or home page
        // window.location.href = "dashboard.html";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Signin failed: " + error.message);
      });
  };