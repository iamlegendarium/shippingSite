const signupBtn = (event) => {
  event.preventDefault();
  // let url = "https://shippingsite.onrender.com/api/register";
  let url = "http://localhost:3000/api/register";

  const firstName = document.getElementById("fName").value;
  const lastName = document.getElementById("lName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (firstName == "" || lastName == "" || email == "" || password == "") {
    // alert("Alaye, when you are not blind. Fill in something jor")
    showError.style.display = "block";
    return; // Return from the function to prevent further execution
  }

  const data = {
    firstName,
    lastName,
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
      // console.log("Successfully registered", data);
      // alert("Signup successful!");
      window.location.href = "verifyEmail.html";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Signup failed: " + error.message);
    });
};
