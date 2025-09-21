// Toggle Password
    document.getElementById('togglePassword').addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Toggle Confirm Password
    document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
      const confirmPasswordInput = document.getElementById('confirmPassword');
      const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmPasswordInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    $(document).ready(function() {
      $("#signupForm").submit(function(e) {
        e.preventDefault();

        let username = $("#username").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let confirmPassword = $("#confirmPassword").val();

        if(password !== confirmPassword) {
          $("#errorAlert").html("Passwords do not match!").show();
          return;
        }

        $("#loadingSpinner").show();
        $("#submitButton").prop("disabled", true);
        $("#errorAlert").hide();

        $.ajax({
          url: "http://localhost:8080/auth/register", 
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            username: username,
            email: email,
            password: password,
            role: "USER"   // default role always USER
          }),
          success: function(response) {
            $("#successAlert").html("Registration successful! Redirecting to login...").show();
            setTimeout(() => {
              window.location.href = "LoginPage.html";
            }, 1500);
          },
          error: function(xhr) {
            let errMsg = xhr.responseJSON ? xhr.responseJSON.data : "Registration failed!";
            $("#errorAlert").html(errMsg).show();
          },
          complete: function() {
            $("#loadingSpinner").hide();
            $("#submitButton").prop("disabled", false);
          }
        });
      });
    });