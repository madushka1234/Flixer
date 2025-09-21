
let movieTable;
const TMDB_KEY = "8eaf4b353f53d2952b8fb3f8bedbbddd";
const SUBTITLEAPI = "https://managapi-eak67.kinsta.app/download_subtitles?name=";

// 🍪 Cookie value ගන්න function එක
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// 🎬 Subtitles fetch function
async function fetchSubtitles(name) {
  try {
    const res = await fetch(`${SUBTITLEAPI}${encodeURIComponent(name)}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.subtitle_url || "";
  } catch (err) {
    console.error("Subtitle fetch failed:", err);
    return "";
  }
}

// ✅ Document ready
$(document).ready(function () {
  // DataTable init
  movieTable = $("#moviesTable").DataTable({
    ajax: function (data, callback) {
      fetch("http://localhost:8080/api/movies?size=1000", {
        headers: { Authorization: "Bearer " + getCookie("accessToken") },
      })
        .then((res) => res.json())
        .then((json) => {
          // Backend paginated response නම් content use කරන්න
          const movies = json.content ? json.content : json;
          console.log("Movies fetched:", movies);
          callback({ data: movies });
        })
        .catch((err) => {
          console.error("Error loading movies:", err);
          callback({ data: [] });
        });
    },
    columns: [
      { data: "title" },
      { data: "year" },
      { data: "genres" },
      { data: "description" },
      {
        data: "imageUrl",
        render: (data, type, row) =>
          data
            ? `<img src="${data}" alt="${row.title}" 
                 style="width:60px; height:80px; object-fit:cover; border-radius:4px;">`
            : `<span class="text-muted">No Image</span>`,
      },
      {
        data: "videoUrl",
        render: (data) =>
          data && data.trim() !== ""
            ? `<span class="badge bg-success">Available</span>`
            : `<span class="badge bg-warning text-dark">Pending</span>`,
      },
      {
        data: "subtitleUrl",
        render: (data) =>
          data && data.trim() !== ""
            ? `<span class="badge bg-success">Available</span>`
            : `<span class="badge bg-warning text-dark">Pending</span>`,
      },
      {
        data: null,
        render: (data, type, row) => `
          <button class="btn btn-sm btn-primary" onclick="editMovie(${row.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteMovie(${row.id})">
            <i class="fas fa-trash"></i>
          </button>`,
      },
    ],
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    language: {
      search: "",
      searchPlaceholder: "Search movies...",
      paginate: {
        previous: "<i class='fas fa-chevron-left'></i>",
        next: "<i class='fas fa-chevron-right'></i>",
      },
    },
  });

  updateTotalMovies();
});

// 🍿 Add Movie Modal reset
document.querySelector('[data-bs-target="#movieModal"]').addEventListener("click", function () {
  $("#movieForm")[0].reset();
  $("#movieId").val("");
  $("#modalTitle").text("Add Movie");
  $("#deleteMovieBtn").addClass("d-none");
  $("#saveMovieBtn").off("click").on("click", addMovie);
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("dropImagePreview").style.display = "none";
});

// ✅ Add Movie
async function addMovie() {
  const movie = collectMovieFormData();

  const res = await fetch("http://localhost:8080/api/movies?size=1000", {
    headers: { Authorization: "Bearer " + getCookie("accessToken") },
  });
  const data = await res.json();
  const movies = data.content ? data.content : data;

  const exists = movies.some(m => m.title.toLowerCase() === movie.title.toLowerCase());
  if (exists) {
    alert("This movie is already added!");
    return;
  }

  fetch("http://localhost:8080/api/movies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getCookie("accessToken"),
    },
    body: JSON.stringify(movie),
  }).then(() => {
    bootstrap.Modal.getInstance(document.getElementById("movieModal")).hide();
    movieTable.ajax.reload(null, true); // page reset
    updateTotalMovies();
    alert("Movie added successfully!");
  });
}

// ✅ Update Movie
function updateMovie() {
  const id = $("#movieId").val();
  const updatedMovie = collectMovieFormData();

  fetch(`http://localhost:8080/api/movies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getCookie("accessToken"),
    },
    body: JSON.stringify(updatedMovie),
  }).then(() => {
    bootstrap.Modal.getInstance(document.getElementById("movieModal")).hide();
    movieTable.ajax.reload(null, false);
    updateTotalMovies();
    alert("Movie updated successfully!");
  });
}

// ✅ Delete Movie
function deleteMovie(id) {
  if (confirm("Are you sure you want to delete this movie?")) {
    fetch(`http://localhost:8080/api/movies/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + getCookie("accessToken") },
    }).then(() => {
      const modalEl = document.getElementById("movieModal");
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      setTimeout(() => {
        movieTable.ajax.reload(null, true);
        updateTotalMovies();
      }, 300);
      alert("Movie deleted successfully!");
    });
  }
}

// ✅ Edit Movie
function editMovie(id) {
  fetch(`http://localhost:8080/api/movies/${id}`, {
    headers: { Authorization: "Bearer " + getCookie("accessToken") },
  })
    .then((res) => res.json())
    .then((movie) => {
      $("#movieId").val(movie.id);
      $("#title").val(movie.title);
      $("#year").val(movie.year);
      $("#genres").val(movie.genres);
      $("#description").val(movie.description);
      $("#imageUrl").val(movie.imageUrl);
      $("#dropimageUrl").val(movie.dropimageUrl);
      $("#videoUrl").val(movie.videoUrl);
      $("#subtitleUrl").val(movie.subtitleUrl);
      $("#modalTitle").text("Edit Movie");
      $("#deleteMovieBtn").removeClass("d-none").off("click").on("click", () => deleteMovie(id));
      $("#saveMovieBtn").off("click").on("click", updateMovie);

      new bootstrap.Modal(document.getElementById("movieModal")).show();
    });
}

// 🎥 Collect form data
function collectMovieFormData() {
  return {
    title: $("#title").val(),
    year: $("#year").val(),
    genres: $("#genres").val(),
    description: $("#description").val(),
    imageUrl: $("#imageUrl").val(),
    dropimageUrl: $("#dropimageUrl").val(),
    videoUrl: $("#videoUrl").val(),
    subtitleUrl: $("#subtitleUrl").val(),
  };
}

// 🖼 Image preview
document.getElementById("imageUrl").addEventListener("input", function () {
  const preview = document.getElementById("imagePreview");
  if (this.value.trim() !== "") {
    preview.src = this.value;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
});

// 🎬 TMDB search
$("#tmdbSearch").on("input", function () {
  const query = $(this).val().trim();
  if (query.length < 2) { $("#tmdbResults").hide(); return; }

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const results = data.results.slice(0, 5);
      if (results.length === 0) { $("#tmdbResults").hide(); return; }

      let html = "";
      results.forEach(movie => {
        const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
        const poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
          : "https://via.placeholder.com/100x150?text=No+Image";
        const backdrop = movie.backdrop_path
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
          : "https://via.placeholder.com/100x150?text=No+Image";

        html += `
          <button type="button" class="list-group-item list-group-item-action d-flex align-items-center"
                  data-id="${movie.id}" data-title="${movie.title}" data-year="${year}"
                  data-desc="${movie.overview}" data-img="${poster}" data-drop="${backdrop}">
            <img src="${poster}" style="width:40px; height:60px; object-fit:cover; border-radius:4px; margin-right:10px;">
            <div>
              <div><strong>${movie.title}</strong> (${year})</div>
              <small>${movie.overview.substring(0, 60)}...</small>
            </div>
          </button>`;
      });

      $("#tmdbResults").html(html).show();
    });
});

// ✅ TMDB result select
$(document).on("click", "#tmdbResults button", async function () {
  const title = $(this).data("title");
  const year = $(this).data("year");
  const desc = $(this).data("desc");
  const img = $(this).data("img");
  const drop = $(this).data("drop");
  const movieId = $(this).data("id");

  $("#title").val(title);
  $("#year").val(year);
  $("#description").val(desc);
  $("#imageUrl").val(img);
  $("#imagePreview").attr("src", img).show();
  $("#dropimageUrl").val(drop);
  $("#dropImagePreview").attr("src", drop).show();
  $("#videoUrl").val(`https://vidsrc.xyz/embed/movie/${movieId}`);

  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}`);
  const data = await res.json();
  if (data.genres) {
    const genres = data.genres.map(g => g.name).join(", ");
    $("#genres").val(genres);
  }

  $("#tmdbResults").hide();
  $("#tmdbSearch").val("");
});

// Hide TMDB results if clicked outside
$(document).on("click", function (e) {
  if (!$(e.target).closest("#tmdbSearch, #tmdbResults").length) {
    $("#tmdbResults").hide();
  }
});

// 🔢 Update total movies card
async function updateTotalMovies() {
  try {
    const res = await fetch("http://localhost:8080/api/movies", {
      headers: { "Authorization": "Bearer " + getCookie("accessToken") }
    });
    const data = await res.json();
    document.getElementById("totalMovies").innerText =
      data.totalElements || data.length || 0;
  } catch (err) {
    console.error("Failed to fetch movie count:", err);
  }
}

// 🔒 Logout
function logout() {
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "LoginPage.html";
}

// ✅ Token check
function checkToken() {
  if (!getCookie("accessToken")) logout();
}
checkToken();

// 🖥 Sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('overlay');

  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });

  content.addEventListener('click', function() {
    if (window.innerWidth < 768 && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    }
  });
});

