// Get cookie helper
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }

        // Movie play modal function (iframe embed)
        function playMovie(embedUrl, title) {
            const iframe = document.getElementById("movieIframe");
            const modalTitle = document.getElementById("movieTitle");

            modalTitle.textContent = title;
            iframe.src = embedUrl;

            const modal = new bootstrap.Modal(document.getElementById('moviePlayerModal'));
            modal.show();

            // clear iframe src when modal closed
            document.getElementById('moviePlayerModal').addEventListener('hidden.bs.modal', () => {
                iframe.src = "";
            }, { once: true });
        }

        function removeFromMyList(movieId, cardElement) {
            const userId = sessionStorage.getItem('userId'); // Logged-in user ID
            const token = getCookie("accessToken");

            if (!token || !userId) {
                alert('Please log in to manage your list');
                return;
            }

            if (!confirm('Are you sure you want to remove this from your list?')) return;

            fetch(`http://localhost:8080/api/users/${userId}/mylist/${movieId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                credentials: 'include'
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to remove movie');
                return res.json();
            })
            .then(data => {
                cardElement.remove();
                showNotification('Removed from your list');
                if(document.getElementById("myListContent").children.length === 0){
                    showEmptyState();
                }
            })
            .catch(err => {
                console.error(err);
                alert('Failed to remove movie. Check console.');
            });
        }


        // Show notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded';
            notification.style.zIndex = '1050';
            notification.innerText = message;
            
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Show empty state
        function showEmptyState() {
            const container = document.getElementById("myListContent");
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>Your list is empty</h3>
                    <p>Add movies and TV shows to your list to watch them later</p>
                    <a href="dashboard.html" class="btn btn-primary mt-3">Browse Content</a>
                </div>
            `;
        }

        function loadMyList() {
            const container = document.getElementById("myListContent");
            const userId = sessionStorage.getItem('userId');
            const token = getCookie("accessToken");

            if (!userId || !token) {
                showEmptyState();
                return;
            }

            fetch(`http://localhost:8080/api/users/${userId}/mylist`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                credentials: 'include'
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch My List');
                return res.json();
            })
            .then(movieIds => {
                // You may need to fetch movie details by IDs from your movie API
                // Example: fetch movie details for each ID
                Promise.all(movieIds.map(id => fetch(`http://localhost:8080/api/movies/${id}`).then(r => r.json())))
                .then(movies => renderMyList(movies));
            })
            .catch(err => {
                console.error(err);
                showEmptyState();
            });
        }


        // Render My List content
        function renderMyList(movies) {
            const container = document.getElementById("myListContent");
            
            if (!movies || movies.length === 0) {
                showEmptyState();
                return;
            }
            
            container.innerHTML = '';
            
            movies.forEach(movie => {
                const safeTitle = movie.title.replace(/'/g, "\\'");
                const safeImage = movie.imageUrl || 'https://via.placeholder.com/220x300/1a1a1a/ffffff?text=No+Image';
                const safeEmbed = movie.videoUrl || '';

                const card = document.createElement("div");
                card.className = "movie-card";
                card.setAttribute('data-type', movie.type || 'movie');
                card.setAttribute('data-added', movie.addedDate || new Date().toISOString());
                
                card.innerHTML = `
                    <img src="${safeImage}" alt="${safeTitle}" class="movie-poster">
                    <div class="movie-info">
                        <div class="movie-title">${safeTitle}</div>
                        <div class="movie-meta">
                            <span>${movie.year || 'N/A'}</span>
                            <span class="rating"><i class="fas fa-star"></i> ${movie.rating || 'N/A'}</span>
                        </div>
                        <span class="category">${movie.genres || (movie.type === 'show' ? 'TV Show' : 'Movie')}</span>
                    </div>
                    <div class="movie-overlay">
                        <h5>${safeTitle}</h5>
                        <p>${movie.year || 'N/A'} • ${movie.genres || (movie.type === 'show' ? 'TV Show' : 'Movie')}</p>
                        <p class="desc">${movie.description ? movie.description.substring(0, 80) + '...' : ''}</p>
                        <div class="overlay-actions">
                            <button onclick="playMovie('${safeEmbed}', '${safeTitle}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="remove-btn" onclick="removeFromMyList(${movie.id}, this.closest('.movie-card'))">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="actions">
                        <button onclick="playMovie('${safeEmbed}', '${safeTitle}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="remove-btn" onclick="removeFromMyList(${movie.id}, this.closest('.movie-card'))">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                container.appendChild(card);
            });
            
            // Setup filter functionality
            setupFiltering();
        }

        // Setup filtering functionality
        function setupFiltering() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Update active state
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Get filter value
                    const filter = button.getAttribute('data-filter');
                    
                    // Filter movies
                    const movies = document.querySelectorAll('.movie-card');
                    
                    movies.forEach(movie => {
                        let show = true;
                        
                        if (filter === 'movies') {
                            show = movie.getAttribute('data-type') === 'movie';
                        } else if (filter === 'shows') {
                            show = movie.getAttribute('data-type') === 'show';
                        } else if (filter === 'recent') {
                            // Show items added in the last 30 days
                            const addedDate = new Date(movie.getAttribute('data-added'));
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            show = addedDate > thirtyDaysAgo;
                        }
                        // 'all' shows everything
                        
                        movie.style.display = show ? 'block' : 'none';
                    });
                    
                    // Check if any items are visible after filtering
                    const visibleMovies = document.querySelectorAll('.movie-card[style="display: block"]');
                    if (visibleMovies.length === 0) {
                        const container = document.getElementById("myListContent");
                        container.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-filter"></i>
                                <h3>No items match your filter</h3>
                                <p>Try selecting a different filter</p>
                            </div>
                        `;
                    }
                });
            });
        }

        // Logout function
        function logout() {
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "LoginPage.html";
        }

        // Initialize when page loads
        document.addEventListener("DOMContentLoaded", () => {
            loadMyList();
        });