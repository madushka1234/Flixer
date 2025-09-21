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

        // Add to My List function
        function addToMyList(movieId, button) {
            const token = getCookie("accessToken");
            
            if (!token) {
                alert('Please log in to add to your list');
                return;
            }
            
            // In a real app, you would call your backend API here
            console.log(`Adding movie ${movieId} to My List`);
            
            // Change button appearance to indicate it's added
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.backgroundColor = 'var(--primary-color)';
            
            // Show success message
            showNotification('Added to your list');
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

        // Global variables
        let allMovies = [];
        let filteredMovies = [];

        // Load all movies from backend
        function loadAllMovies() {
            const container = document.getElementById("moviesContainer");
            const token = getCookie("accessToken");

            container.innerHTML = `<div class="loading-spinner">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`;

            fetch(`http://localhost:8080/api/movies?size=1000`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? "Bearer " + token : ""
                },
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("All movies data:", data);
                allMovies = data.content || data;
                filteredMovies = [...allMovies];
                
                renderMovies(allMovies);
                updateMoviesCount(allMovies.length);
            })
            .catch(err => {
                console.error("Failed to load all movies:", err);
                // Fallback to sample data
                const sampleData = getSampleData();
                allMovies = sampleData;
                filteredMovies = [...sampleData];
                renderMovies(sampleData);
                updateMoviesCount(sampleData.length);
            });
        }

        // Render movies to the container
        function renderMovies(movies) {
            const container = document.getElementById("moviesContainer");
            
            if (!movies || movies.length === 0) {
                container.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-film"></i>
                        <h3>No movies found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            
            movies.forEach((movie) => {
                const safeTitle = movie.title ? movie.title.replace(/'/g, "\\'") : 'Untitled';
                const safeImage = movie.imageUrl || 'https://via.placeholder.com/220x300/1a1a1a/ffffff?text=No+Image';
                const safeEmbed = movie.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
                const safeYear = movie.year || 'N/A';
                const safeRating = movie.rating || 'N/A';
                const safeGenres = movie.genres || 'Movie';
                const safeDescription = movie.description ? movie.description.substring(0, 80) + '...' : 'No description available';

                const card = document.createElement("div");
                card.className = "movie-card";
                
                card.innerHTML = `
                    <img src="${safeImage}" alt="${safeTitle}" class="movie-poster">
                    <div class="movie-overlay">
                        <h5>${safeTitle}</h5>
                        <p>${safeYear} • ${safeGenres}</p>
                        <p class="desc">${safeDescription}</p>
                        <div class="overlay-actions">
                            <button onclick="playMovie('${safeEmbed}', '${safeTitle}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button onclick="addToMyList(${movie.id || Math.floor(Math.random() * 1000)}, this)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                container.appendChild(card);
            });
        }

        // Update movies count display
        function updateMoviesCount(count) {
            const countElement = document.getElementById("moviesCount");
            countElement.textContent = `${count} movies found`;
        }

        // Search movies function
        function searchMovies(query) {
            if (!query || query.trim() === '') {
                filteredMovies = [...allMovies];
                renderMovies(allMovies);
                updateMoviesCount(allMovies.length);
                return;
            }
            
            query = query.toLowerCase().trim();
            
            filteredMovies = allMovies.filter(movie => 
                (movie.title && movie.title.toLowerCase().includes(query)) ||
                (movie.genres && movie.genres.toLowerCase().includes(query)) ||
                (movie.year && movie.year.toString().includes(query)) 
            );
            
            renderMovies(filteredMovies);
            updateMoviesCount(filteredMovies.length);
        }

        // Filter movies by category
        function filterMovies(category) {
            if (category === 'all') {
                filteredMovies = [...allMovies];
            } else if (category === 'rating') {
                filteredMovies = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (category === '2023') {
                filteredMovies = allMovies.filter(movie => movie.year == 2023);
            } else {
                filteredMovies = allMovies.filter(movie => 
                    movie.genres && movie.genres.toLowerCase().includes(category.toLowerCase())
                );
            }
            
            renderMovies(filteredMovies);
            updateMoviesCount(filteredMovies.length);
        }

        // Setup event listeners
        function setupEventListeners() {
            // Search functionality
            const searchInput = document.getElementById('searchInput');
            const searchButton = document.getElementById('searchButton');
            
            searchInput.addEventListener('input', (e) => {
                searchMovies(e.target.value);
            });
            
            searchButton.addEventListener('click', () => {
                searchMovies(searchInput.value);
            });
            
            // Filter buttons
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Update active state
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Apply filter
                    const filter = button.getAttribute('data-filter');
                    filterMovies(filter);
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
            loadAllMovies();
            setupEventListeners();
        });