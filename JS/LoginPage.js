// Show/Hide password
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Save cookies
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

// Login form submit
$(document).ready(function() {
    $("#loginForm").submit(function(e) {
        e.preventDefault();

        let username = $("#username").val();
        let password = $("#password").val();

        $("#loadingSpinner").show();
        $("#submitButton").prop("disabled", true);
        $("#errorAlert").hide();
        $("#successAlert").hide();

        $.ajax({
            url: "http://localhost:8080/auth/login", 
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: function(response) {
                // Save JWT cookie & sessionStorage
                setCookie("accessToken", response.data.accessToken, 1);
                sessionStorage.setItem("userId", response.data.id);

                let role = response.data.role;
                $("#successAlert").html("Login successful! Redirecting...").show();

                setTimeout(() => {
                    window.location.href = role === "ADMIN" ? "AdminDashboard.html" : "Dashboard.html";
                }, 1500);
            },
            error: function(xhr) {
                let errMsg = xhr.responseJSON ? xhr.responseJSON.data : "Login failed!";
                $("#errorAlert").html(errMsg).show();
            },
            complete: function() {
                $("#loadingSpinner").hide();
                $("#submitButton").prop("disabled", false);
            }
        });
    });
});
