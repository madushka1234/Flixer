let currentPage = 0;
const pageSize = 6;
let allMovies = []; // Store all movies for search functionality

// Cookie value ගන්න function
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Movie play modal function
function playMovie(embedUrl, title) {
    const iframe = document.getElementById("movieIframe");
    const modalTitle = document.getElementById("movieTitle");

    modalTitle.textContent = title;
    iframe.src = embedUrl;

    const modal = new bootstrap.Modal(document.getElementById('moviePlayerModal'));
    modal.show();

    document.getElementById('moviePlayerModal').addEventListener('hidden.bs.modal', () => {
        iframe.src = "";
    }, { once: true });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded';
    notification.style.zIndex = '1050';
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// Add to My List function
function addToMyList(movieId, buttonElement) {
    const userId = sessionStorage.getItem('userId');
    const token = getCookie("accessToken");

    if (!userId || !token) {
        alert('Please log in to add movies to your list');
        return;
    }

    fetch(`http://localhost:8080/api/users/${userId}/mylist/${movieId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to add movie');
        return res.json();
    })
    .then(() => {
        showNotification('Added to your list');
        buttonElement.innerHTML = '<i class="fas fa-check"></i>';
        buttonElement.disabled = true;
    })
    .catch(err => {
        console.error(err);
        alert('Failed to add movie. Check console.');
    });
}

// Search movies function
function searchMovies(query) {
    const searchResults = document.getElementById('searchResults');
    
    if (!query || query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const filteredMovies = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        (movie.genres && movie.genres.toLowerCase().includes(query.toLowerCase()))
    );
    
    displaySearchResults(filteredMovies);
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No movies found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    results.slice(0, 8).forEach(movie => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <img src="${movie.imageUrl || 'https://via.placeholder.com/50x70/1a1a1a/ffffff?text=No+Image'}" 
                 alt="${movie.title}" class="search-result-img">
            <div class="search-result-info">
                <div class="search-result-title">${movie.title}</div>
                <div class="search-result-meta">
                    ${movie.year || 'N/A'} • ${movie.genres || 'Movie'}
                </div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            playMovie(movie.videoUrl, movie.title);
            searchResults.style.display = 'none';
            document.getElementById('searchInput').value = '';
        });
        
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
}

// Load dashboard movies
function loadDashboardMovies() {
    const container = document.getElementById("dashboardMovies");
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
            "Authorization": "Bearer " + token
        },
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        container.innerHTML = '';
        allMovies = data.content || data; // Store for search functionality
        
        if (!allMovies || allMovies.length === 0) {
            container.innerHTML = "<p class='text-warning'>No movies found.</p>";
            return;
        }

        allMovies.sort((a, b) => (b.year || 0) - (a.year || 0));

        allMovies.forEach(movie => {
            const safeTitle = movie.title.replace(/'/g, "\\'");
            const safeImage = movie.imageUrl || 'https://via.placeholder.com/220x300/1a1a1a/ffffff?text=No+Image';
            const safeEmbed = movie.videoUrl || '';

            const card = document.createElement("div");
            card.className = "movie-card";
            card.innerHTML = `
                <img data-src="${safeImage}" alt="${safeTitle}" class="movie-poster" src="https://via.placeholder.com/10x15/1a1a1a/ffffff?text=...">
                <div class="movie-overlay">
                    <h5>${safeTitle}</h5>
                    <p>${movie.year || 'N/A'} • ${movie.genres || 'Movie'}</p>
                    <p class="desc">${movie.description ? movie.description.substring(0, 80) + '...' : ''}</p>
                    <div class="overlay-actions">
                        <button onclick="playMovie('${safeEmbed}', '${safeTitle}')"><i class="fas fa-play"></i></button>
                        <button onclick="addToMyList(${movie.id}, this)"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Lazy load images
        const lazyImages = document.querySelectorAll('.movie-poster');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: "0px 0px 100px 0px" });

        lazyImages.forEach(img => observer.observe(img));
    })
    .catch(err => {
        console.error("Failed to load movies:", err);
        container.innerHTML = `<div class="text-center py-5">
            <p class="text-danger">Failed to load movies. Check backend server.</p>
            <p class="text-muted">${err.message}</p>
            <button class="btn btn-primary mt-2" onclick="loadDashboardMovies()">Try Again</button>
        </div>`;
    });
}

// Load hero carousel
function loadHeroMovies() {
    const token = getCookie("accessToken");
    const heroInner = document.getElementById("heroCarouselInner");
    const heroCarouselEl = document.getElementById('heroCarousel');

    fetch(`http://localhost:8080/api/movies?page=0&size=20`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        let movies = data.content || data;
        movies.sort((a,b) => (b.year || 0) - (a.year || 0));
        if (!movies || movies.length === 0) return;
        heroInner.innerHTML = '';

        movies.forEach((movie, index) => {
            const safeTitle = movie.title.replace(/'/g, "\\'");
            const safeDesc = movie.description ? movie.description.replace(/'/g, "\\'") : '';
            const safeImage = movie.dropimageUrl || 'https://via.placeholder.com/800x400?text=No+Image';

            const slide = document.createElement("div");
            slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${safeImage}')`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            slide.style.height = '87vh';
            slide.innerHTML = `
                <div class="carousel-caption">
                    <h1>${safeTitle}</h1>
                    <p>${safeDesc}</p>
                    <button class="btn btn-primary btn-lg me-2 play-btn"><i class="fas fa-play me-2"></i>Play</button>
                    <button class="btn btn-outline-light btn-lg" onclick="addToMyList(${movie.id}, this)"><i class="fas fa-plus me-2"></i>My List</button>
                </div>
            `;
            heroInner.appendChild(slide);

            slide.querySelector(".play-btn").addEventListener("click", () => playMovie(movie.videoUrl, movie.title));
        });

        new bootstrap.Carousel('#heroCarousel', { interval: 15000, ride: 'carousel', touch: false, keyboard: false, pause: false });
    })
    .catch(err => console.error("Failed to load hero movies:", err));
}

// Logout
function logout() {
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "LoginPage.html";
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    loadHeroMovies();
    loadDashboardMovies();
    
    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', (e) => {
        searchMovies(e.target.value);
    });
    
    searchButton.addEventListener('click', () => {
        searchMovies(searchInput.value);
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Prevent hiding when clicking inside search results
    searchResults.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});