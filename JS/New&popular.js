
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
            // For now, we'll just simulate the addition
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

        // Load all movies from backend
        function loadAllMovies() {
            const container = document.getElementById("allMovies");
            const token = getCookie("accessToken");

            // Try to fetch from backend API
            fetch(`http://localhost:8080/api/movies?size=10000`, {
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
                const movies = data.content || data;
                renderMovies(container, movies, 'all');
                
                // Also populate other sections with filtered data
                populateFilteredSections(movies);
            })
            .catch(err => {
                console.error("Failed to load all movies:", err);
                // Fallback to sample data
                const sampleData = getSampleData('all');
                renderMovies(container, sampleData, 'all');
                populateFilteredSections(sampleData);
            });
        }

        // Populate filtered sections based on all movies data
        function populateFilteredSections(allMovies) {
            if (!allMovies || allMovies.length === 0) return;
            
            // New releases (movies from current year)
            const currentYear = new Date().getFullYear();
            const newReleases = allMovies.filter(movie => movie.year >= currentYear - 1);
            renderMovies(document.getElementById("newReleases"), newReleases, 'new');
            
            // Trending (movies with high rating)
            const trending = [...allMovies].sort((a, b) => b.rating - a.rating).slice(0, 10);
            renderMovies(document.getElementById("trendingNow"), trending, 'trending');
            
            // Top rated (sorted by rating)
            const topRated = [...allMovies].sort((a, b) => b.rating - a.rating).slice(0, 10);
            renderMovies(document.getElementById("top10"), topRated, 'top');
        }

        // Render movies to a container
        function renderMovies(container, movies, type) {
            if (!container) return;
            
            if (!movies || movies.length === 0) {
                container.innerHTML = '<p class="text-warning">No content available</p>';
                return;
            }
            
            container.innerHTML = '';
            
            movies.forEach((movie, index) => {
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
                    ${type === 'new' ? '<span class="new-badge">NEW</span>' : ''}
                    ${type === 'trending' ? '<span class="trending-badge">TRENDING</span>' : ''}
                    ${type === 'top' ? `<span class="top-10-badge"><i class="fas fa-crown"></i> #${index + 1}</span>` : ''}
                    
                    <div class="movie-overlay">
                        <h5>${safeTitle}</h5>
                        <p>${safeYear} • ${safeGenres}</p>
                        <p class="desc">${safeDescription}</p>
                        <div class="overlay-actions">
                            <button onclick="playMovie('${safeEmbed}', '${safeTitle}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button onclick="addToMyList(${movie.id || index}, this)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                `;
                
                container.appendChild(card);
            });
        }

        // Setup category tabs
        function setupCategoryTabs() {
            const tabs = document.querySelectorAll('.category-tab');
            const sections = {
                'all': document.getElementById('allMoviesSection'),
                'new': document.getElementById('newReleasesSection'),
                'trending': document.getElementById('trendingSection'),
                'top': document.getElementById('top10Section')
            };
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Get category
                    const category = tab.getAttribute('data-category');
                    
                    // Hide all sections
                    Object.values(sections).forEach(section => {
                        if (section) section.style.display = 'none';
                    });
                    
                    // Show selected section
                    if (sections[category]) {
                        sections[category].style.display = 'block';
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
            loadAllMovies();
            setupCategoryTabs();
        });
    