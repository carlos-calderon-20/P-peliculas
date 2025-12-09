/**
 * API Key for OMDb service.
 * @const {string}
 */
const API_KEY = "1f2a3c7e";

/**
 * Initialize the application based on the current page's content container.
 * Runs on DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("timeline-container")) {
    cargarNovedades();
  } else if (document.getElementById("popular-container")) {
    cargarPopulares();
  } else if (document.getElementById("detalle-container")) {
    cargarDetalle();
  }
});

/**
 * Allows searching by pressing the Enter key in the search input field.
 */
// Allow searching by pressing Enter
const inputTitulo = document.getElementById("titulo");
if (inputTitulo) {
  inputTitulo.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      buscarPelicula();
    }
  });
}

/**
 * Redirects the user to the details page for a specific movie.
 * @param {string} imdbID - The IMDb ID of the movie.
 */
function verDetalle(imdbID) {
  window.location.href = `detalle.html?id=${imdbID}`;
}

/**
 * Searches for movies using the OMDb API based on the input value.
 * Handles redirection if not on the main search page.
 * @async
 */
async function buscarPelicula() {
  const input = document.getElementById("titulo");
  if (!input) return;

  const titulo = input.value;
  if (!titulo) return;

  // Search logic
  // For popular page or others, redirecting to index.html with search param would be ideal,
  // but keeping it simple as requested previously.
  let grid = document.getElementById("grid-peliculas");

  if (!grid) {
    // Logic for search on other pages
    window.location.href = `index.html?search=${encodeURIComponent(titulo)}`;
    return;
  }

  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(titulo)}`;

  grid.innerHTML = '<p style="color:white; grid-column:1/-1; text-align:center;">Buscando...</p>';

  try {
    const res = await fetch(url);
    const data = await res.json();

    grid.innerHTML = "";

    if (data.Response === "False") {
      grid.innerHTML = "<p class='placeholder-msg'>No se encontraron resultados para ese título.</p>";
      return;
    }

    data.Search.forEach(peli => {
      const posterUrl = peli.Poster !== "N/A" ? peli.Poster : 'https://via.placeholder.com/300x450/10161d/ffffff?text=No+Image';

      const card = document.createElement("div");
      card.className = "card";
      card.onclick = () => verDetalle(peli.imdbID);
      card.innerHTML = `
        <img src="${posterUrl}" alt="${peli.Title}">
        <div class="info">
          <h3>${peli.Title}</h3>
          <p>${peli.Year}</p>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    grid.innerHTML = "<p class='placeholder-msg'>Algo salió mal. Por favor, inténtalo de nuevo.</p>";
  }
}

/**
 * Checks for a search query parameter in the URL on index page load
 * and automatically performs a search if one is found.
 */
// Check if we have a search query param on index load
if (document.getElementById("grid-peliculas")) {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    document.getElementById("titulo").value = searchParam;
    buscarPelicula();
  }
}

/**
 * Loads the "New" releases timeline simulation.
 * Fetches data for simulated categories like "Today", "Yesterday", etc.
 * @async
 */
async function cargarNovedades() {
  const container = document.getElementById("timeline-container");
  container.innerHTML = '<p style="text-align:center; color: #9CA4AB;">Cargando estrenos del día...</p>';

  // Simulating "New" by fetching random recent popular keywords
  // Since OMDb doesn't have "latest", we'll search for broad terms like "2024" or "Action"
  const queries = ["2024", "Action", "Drama"];
  const titles = ["Hoy", "Ayer", "Esta semana"];

  container.innerHTML = "";

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const sectionTitle = titles[i];

    try {
      const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&y=2024&type=movie`);
      const data = await res.json();

      if (data.Search) {
        // Create Section
        const timelineGroup = document.createElement("div");
        timelineGroup.className = "timeline-group";

        const groupTitle = document.createElement("h3");
        groupTitle.className = "timeline-date";
        groupTitle.textContent = sectionTitle;
        timelineGroup.appendChild(groupTitle);

        const scrollRow = document.createElement("div");
        scrollRow.className = "scroll-row";

        data.Search.forEach(peli => {
          const posterUrl = peli.Poster !== "N/A" ? peli.Poster : 'https://via.placeholder.com/300x450/10161d/ffffff?text=No+Image';
          const card = document.createElement("div");
          card.className = "card landscape-card"; // Different style for timeline? Or same? JustWatch uses similar cards.
          card.onclick = () => verDetalle(peli.imdbID);
          card.innerHTML = `
                    <img src="${posterUrl}" alt="${peli.Title}">
                    <div class="info">
                        <h3>${peli.Title}</h3>
                    </div>
                `;
          scrollRow.appendChild(card);
        });

        timelineGroup.appendChild(scrollRow);
        container.appendChild(timelineGroup);
      }

    } catch (e) {
      console.error("Error loading timeline", e);
    }
  }
}

/**
 * Loads the "Popular" movies list.
 * Uses a curated list of famous movies since the API doesn't support 'sort by popularity'.
 * @async
 */
async function cargarPopulares() {
  const container = document.getElementById("popular-container");
  container.innerHTML = '<p style="text-align:center; color: #9CA4AB;">Cargando populares...</p>';

  // Curated list of "popular" movies
  const popularTitles = ["The Dark Knight", "Inception", "Interstellar", "Avengers: Endgame", "Avatar", "The Matrix", "Pulp Fiction", "Fight Club"];

  container.innerHTML = "";

  let rank = 1;

  for (const title of popularTitles) {
    try {
      const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
      const peli = await res.json();

      if (peli.Response === "True") {
        const posterUrl = peli.Poster !== "N/A" ? peli.Poster : 'https://via.placeholder.com/300x450/10161d/ffffff?text=No+Image';

        const card = document.createElement("div");
        card.className = "card";
        card.onclick = () => verDetalle(peli.imdbID);
        card.innerHTML = `
                    <div class="rank-badge">${rank}</div>
                    <img src="${posterUrl}" alt="${peli.Title}">
                    <div class="info">
                        <h3>${peli.Title}</h3>
                        <p>${peli.Year} • ${peli.imdbRating}</p>
                    </div>
                `;
        container.appendChild(card);
        rank++;
      }
    } catch (e) {
      console.error("Error loading movie", title, e);
    }
  }
}

/**
 * Loads details for a specific movie based on the 'id' URL parameter.
 * Renders the poster, metadata, and simulated streaming options.
 * @async
 */
async function cargarDetalle() {
  const container = document.getElementById("detalle-container");
  const urlParams = new URLSearchParams(window.location.search);
  const imdbID = urlParams.get('id');

  if (!imdbID) {
    container.innerHTML = "<p class='placeholder-msg'>Película no especificada.</p>";
    return;
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`);
    const peli = await res.json();

    if (peli.Response === "False") {
      container.innerHTML = "<p class='placeholder-msg'>No se encontraron detalles.</p>";
      return;
    }

    const posterUrl = peli.Poster !== "N/A" ? peli.Poster : 'https://via.placeholder.com/300x450/10161d/ffffff?text=No+Image';

    // Mock "Streaming Options" as OMDb doesn't provide them
    const streamingMock = `
            <div class="streaming-options">
                <h3>Ver ahora</h3>
                <div class="provider-list">
                    <div class="provider-badge">Netflix</div>
                    <div class="provider-badge">Amazon</div>
                    <div class="provider-badge">Disney+</div>
                </div>
            </div>
        `;

    container.innerHTML = `
            <div class="detalle-header">
                <div class="detalle-poster">
                    <img src="${posterUrl}" alt="${peli.Title}">
                </div>
                <div class="detalle-info">
                    <h1>${peli.Title} <span class="year">(${peli.Year})</span></h1>
                    <div class="meta-data">
                        <span class="rating">IMDb ${peli.imdbRating}</span>
                        <span class="runtime">${peli.Runtime}</span>
                        <span class="genre">${peli.Genre}</span>
                    </div>
                    
                    ${streamingMock}

                    <div class="sinopsis">
                        <h3>Sinopsis</h3>
                        <p>${peli.Plot}</p>
                    </div>

                    <div class="cast">
                        <h3>Reparto</h3>
                        <p>${peli.Actors}</p>
                    </div>
                </div>
            </div>
        `;

    // Set background hack if wanted
    // container.style.backgroundImage = `linear-gradient(to bottom, rgba(11, 15, 21, 0.9), var(--bg-color)), url('${posterUrl}')`;
    // Background size cover etc.

  } catch (e) {
    console.error(e);
    container.innerHTML = "<p class='placeholder-msg'>Error al cargar detalles.</p>";
  }
}
