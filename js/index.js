let activeCategory = "all";
const apiKey = "cfdfd510ab2d960857f9947e9d4df55c"; // Replace with your TMDB API key

document.addEventListener("DOMContentLoaded", () => {
  // Initialize event listeners
  document.getElementById("movies-btn").addEventListener("click", () => fetchCategory("movie"));
  document.getElementById("series-btn").addEventListener("click", () => fetchCategory("tv"));
  document.getElementById("animation-btn").addEventListener("click", () => fetchCategory("animation"));
  document.getElementById("browser-btn").addEventListener("click", fetchTrendingMovies);
  document.getElementById("search-btn").addEventListener("click", searchMovies);

  // Fetch initial movies
  fetchTrendingMovies();
});

/**
 * Fetch movies by category using TMDB API.
 */
function fetchCategory(category) {
  let apiUrl;

  if (category === "animation") {
    // Fetch animated movies
    apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&page=1&with_genres=16`;
  } else {
    // Fetch other categories (movies or TV shows)
    apiUrl = `https://api.themoviedb.org/3/discover/${category}?api_key=${apiKey}&language=en-US&page=1`;
  }

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => displayMovies(data.results, true)) // Pass `true` to indicate TMDB data
    .catch((error) => {
      console.error(`Error fetching ${category}:`, error);
      displayError(`Failed to load ${category}. Please try again later.`);
    });
}

/**
 * Fetch trending movies from TMDB API.
 */
function fetchTrendingMovies() {
  const trendingUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`;

  fetch(trendingUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => displayMovies(data.results, true)) // Pass `true` to indicate TMDB data
    .catch((error) => {
      console.error("Error fetching trending movies:", error);
      displayError("Failed to load trending movies. Please try again later.");
    });
}

/**
 * Search for movies or TV shows using TMDB API.
 */
function searchMovies() {
  const searchInput = document.getElementById("search-input").value.toLowerCase().trim();

  if (searchInput === "") {
    fetchTrendingMovies(); // Reset to show trending movies
    return;
  }

  const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(searchInput)}&page=1`;

  fetch(searchUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.results.length === 0) {
        displayError("No results found for your search.");
      } else {
        displayMovies(data.results, true); // Pass `true` to indicate TMDB data
      }
    })
    .catch((error) => {
      console.error("Error searching movies:", error);
      displayError("An error occurred while searching. Please try again later.");
    });
}

/**
 * Display movies or TV shows in the UI.
 */
function displayMovies(movies, isTMDB = false) {
  const container = document.getElementById("movie-container");
  container.innerHTML = ""; // Clear previous content

  if (movies.length === 0) {
    displayError("No results found.");
    return;
  }

  movies.forEach((movie) => {
    const movieId = movie.id;
    const movieTitle = movie.title || movie.name || "Unknown Title";
    const movieGenre = movie.genre_ids ? movie.genre_ids.join(", ") : "N/A";
    const movieYear = movie.release_date || movie.first_air_date || "Unknown";
    const movieDesc = movie.overview || "No description available";
    const movieImage = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "default-image.jpg"; // Default image if no poster is available

    const movieDiv = document.createElement("div");
    movieDiv.classList.add("movie");

    movieDiv.innerHTML = `
      <div class="movie-card">
        <img src="${movieImage}" alt="${movieTitle}" class="clickable" data-id="${movieId}">
        <div class="movie-details">
          <h2 class="clickable" data-id="${movieId}">${movieTitle}</h2>
          <p><strong>Genre:</strong> ${movieGenre}</p>
          <p><strong>Year:</strong> ${movieYear.split("-")[0]}</p>
          <p class="description"><strong>Description:</strong> ${movieDesc}</p>
        </div>
      </div>
    `;

    // Add click event listeners to navigate to the movie details page
    movieDiv.querySelectorAll(".clickable").forEach((element) => {
      element.addEventListener("click", (event) => {
        const movieId = event.target.getAttribute("data-id");
        if (movieId) {
          window.location.href = `movie.html?id=${movieId}`; // Redirect to details page
        }
      });
    });

    container.appendChild(movieDiv);
  });
}

/**
 * Display an error message in the movie container.
 */
function displayError(message) {
  const container = document.getElementById("movie-container");
  container.innerHTML = `<h3>${message}</h3>`;
}
