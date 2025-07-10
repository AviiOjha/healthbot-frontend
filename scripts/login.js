document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent default form submission

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {
    // You can perform validation or authentication logic here if needed
    window.location.href = "home.html"; // Redirect to home page
  } else {
    alert("Please fill in all fields.");
  }
});
