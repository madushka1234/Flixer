

        function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
        }

        
        document.getElementById('sidebarToggle').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const content = document.getElementById('content');
            
            if (sidebar.style.width === '0px' || sidebar.style.width === '') {
                sidebar.style.width = '250px';
                content.style.marginLeft = '250px';
            } else {
                sidebar.style.width = '0';
                content.style.marginLeft = '0';
            }
        });

        
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Revenue (in $)',
                    data: [185000, 192000, 210000, 198000, 215000, 223000, 238000, 245000, 252000, 245832],
                    borderColor: '#e50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });

        
        const userCtx = document.getElementById('userChart').getContext('2d');
        const userChart = new Chart(userCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Pending', 'Suspended'],
                datasets: [{
                    data: [78, 12, 10],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        // 🔹 Update Movies count
        async function updateTotalMovies() {
        try {
            const res = await fetch("http://localhost:8080/api/movies", {
            headers: { Authorization: "Bearer " + getCookie("accessToken") },
            });
            const data = await res.json();
            const total = data.totalElements !== undefined ? data.totalElements : data.length;
            document.getElementById("totalMovies").innerText = total;
        } catch (err) {
            console.error("Failed to fetch movie count:", err);
        }
        }

        // 🔹 Update Users count
        async function updateTotalUsers() {
        try {
            const res = await fetch("http://localhost:8080/api/users", {
            headers: { Authorization: "Bearer " + getCookie("accessToken") },
            });
            const data = await res.json();
            const total = data.totalElements !== undefined ? data.totalElements : data.length;
            document.getElementById("totalUsers").innerText = total;
        } catch (err) {
            console.error("Failed to fetch user count:", err);
        }
        }

        
        function logout() {
        // 🍪 accessToken cookie එක clear කරමු
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        // ✅ sessionStorage/localStorage වලින් තියෙන data clear කරන්න
        sessionStorage.clear();
        localStorage.clear();

        // 🔁 Login page එකට redirect වෙයි
        window.location.href = "LoginPage.html";
        }

        // ✅ Token expire check function එක
        function checkToken() {
        const token = getCookie("accessToken");
        if (!token) {
            // Token නෑනම් -> auto logout
            logout();
        }
        }

        // Load වෙද්දිම check කරන්න
        checkToken();

        // ඔයාගේ API calls fail වෙද්දි 401 Unauthorized ආවොත් -> logout()
        async function apiFetch(url, options = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
            ...(options.headers || {}),
            "Authorization": "Bearer " + getCookie("accessToken")
            }
        });

        if (res.status === 401) {
            logout(); // ✅ Token expire unax
        }
        return res;
        }


        // 🔹 Initial load
        updateTotalMovies();
        updateTotalUsers();

    