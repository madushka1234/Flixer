let table;

// ✅ Generic getCookie function
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// ✅ Reload table wrapper
function reloadUsersTable() {
    if (table) {
        table.ajax.reload(null, false); // keep current page
    }
}

// ✅ Load user stats
function loadUserStats() {
    const token = getCookie("accessToken");
    fetch("http://localhost:8080/api/users/stats", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(stats => {
        document.getElementById("totalUsers").innerText = stats.totalUsers;
        document.getElementById("adminCount").innerText = stats.adminUsers;
        document.getElementById("userCount").innerText = stats.normalUsers;
    })
    .catch(err => console.error("Error loading stats:", err));
}

// ✅ Delete user
function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`http://localhost:8080/api/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + getCookie("accessToken") },
        })
        .then(() => {
            reloadUsersTable();
            loadUserStats();
            alert("User deleted successfully!");
        })
        .catch(err => console.error("Delete failed:", err));
    }
}

// ✅ Edit user (load into modal)
function editUser(id) {
    fetch(`http://localhost:8080/api/users/${id}`, {
        headers: { Authorization: "Bearer " + getCookie("accessToken") },
    })
    .then(res => res.json())
    .then(user => {
        $("#editId").val(user.id);
        $("#editUsername").val(user.username);
        $("#editEmail").val(user.email);
        $("#editRole").val(user.role);
        new bootstrap.Modal(document.getElementById('editUserModal')).show();
    });
}

// ✅ Update user
function updateUser() {
    let id = $("#editId").val();
    let updatedUser = {
        username: $("#editUsername").val(),
        email: $("#editEmail").val(),
        role: $("#editRole").val()
    };

    fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getCookie("accessToken"),
        },
        body: JSON.stringify(updatedUser),
    })
    .then(() => {
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        reloadUsersTable();
        loadUserStats();
        alert("User updated successfully!");
    });
}

// Modal open form clear fields
$('#addUserModal').on('show.bs.modal', function () {
    $("#addUsername, #addEmail, #addPassword, #addConfirmPassword").val("");
    $("#addRole").val("USER");
    $("#addPasswordError").text("");
});

// Email field type වෙද්දි validate කරන code
$("#addEmail").on("input", function() {
    const email = $(this).val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        $("#addPasswordError").text("Please enter a valid email address");
    } else {
        $("#addPasswordError").text(""); // Clear error if valid
    }
});

function addUser() {
    let username = $("#addUsername").val().trim();
    let email = $("#addEmail").val().trim();
    let password = $("#addPassword").val();
    let confirmPassword = $("#addConfirmPassword").val();
    let role = $("#addRole").val();

    // Clear previous errors
    $("#addPasswordError").text("");

    // Required fields check
    if (!username || !email || !password) {
        $("#addPasswordError").text("Please fill in all required fields");
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $("#addPasswordError").text("Please enter a valid email address");
        return;
    }

    // Password confirm check
    if (password !== confirmPassword) {
        $("#addPasswordError").text("Passwords do not match");
        return;
    }

    let newUser = { username, email, password, role };

    fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getCookie("accessToken"),
        },
        body: JSON.stringify(newUser),
    })
    .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
    })
    .then(() => {
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        reloadUsersTable();
        loadUserStats();
        alert("User added successfully!");
    })
    .catch(err => {
        console.error("Error adding user:", err);
        $("#addPasswordError").text("Failed to add user. Try again!");
    });
}




// ✅ Logout
function logout() {
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "LoginPage.html";
}

// ✅ Token expire check
function checkToken() {
    const token = getCookie("accessToken");
    if (!token) logout();
}

// ✅ API wrapper (auto logout on 401)
async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Authorization": "Bearer " + getCookie("accessToken")
        }
    });

    if (res.status === 401) logout();
    return res;
}

// ============================================
// ✅ DOM Ready
// ============================================
$(document).ready(function () {
    checkToken();

    // ✅ Initialize DataTable
    table = $('#usersTable').DataTable({
        ajax: function (data, callback) {
            apiFetch("http://localhost:8080/api/users")
            .then(res => res.json())
            .then(json => callback({ data: json }))
            .catch(err => {
                console.error("Fetch error:", err);
                callback({ data: [] });
            });
        },
        columns: [
            { data: "id" },
            { data: "username" },
            { data: "email" },
            { data: "role" },
            {
                data: null,
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-primary" onclick="editUser(${row.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${row.id})">
                        <i class="fas fa-trash"></i>
                    </button>`
            }
        ],
        pageLength: 25,
        lengthMenu: [5, 10, 25, 50],
        language: {
            search: "",
            searchPlaceholder: "Search users...",
            lengthMenu: "Show _MENU_ entries",
            info: "Showing _START_ to _END_ of _TOTAL_ users",
            infoEmpty: "Showing 0 to 0 of 0 users",
            infoFiltered: "(filtered from _MAX_ total users)",
            paginate: {
                previous: "<i class='fas fa-chevron-left'></i>",
                next: "<i class='fas fa-chevron-right'></i>"
            }
        }
    });

    // ✅ Load stats initially
    loadUserStats();

    // ✅ Add User Modal open
    $("#addUserBtn").click(() => {
        new bootstrap.Modal(document.getElementById('addUserModal')).show();
    });

// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('overlay');
    const searchBox = document.querySelector('.search-box'); // 🔹 search box එක

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Close sidebar when clicking outside on mobile
    content.addEventListener('click', function() {
        if (window.innerWidth < 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // 🔹 Close sidebar if search bar is clicked (mobile only)
    if (searchBox) {
        searchBox.addEventListener('focus', function() {
            if (window.innerWidth < 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
});     
});