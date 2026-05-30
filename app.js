/**
 * app.js
 * CineSphere SPA Core Router, Controllers & Interactivity Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Router and Global Navigation Events
  initApp();
});

// App State Variables
let currentSlideIndex = 0;
let slideInterval = null;
let activeStarsSelected = 0;

/**
 * Initialize core event listeners, triggers, and SPA routing
 */
function initApp() {
  // Listen for hash routing
  window.addEventListener("hashchange", routePage);
  window.addEventListener("load", routePage);

  // Initialize Search elements
  initSearch();

  // Initialize Mobile Menu elements
  initMobileMenu();
}

/**
 * Hash-based Client-side SPA Router
 */
function routePage() {
  const hash = window.location.hash || "#/";
  const appRoot = document.getElementById("app-root");
  
  // Clear any existing slideshow intervals
  if (slideInterval) {
    clearInterval(slideInterval);
  }

  // Update navigation items active state
  updateNavbarActiveState(hash);

  // Scroll to top on navigation
  window.scrollTo(0, 0);

  // Route matches
  // Pattern 1: Movie details -> #/movie/inception
  if (hash.startsWith("#/movie/")) {
    const movieId = hash.replace("#/movie/", "");
    renderMovieDetail(movieId, appRoot);
    return;
  }

  // Pattern 2: Languages -> #/languages or #/languages?lang=Korean
  if (hash.startsWith("#/languages")) {
    const urlParams = new URLSearchParams(hash.includes("?") ? hash.substring(hash.indexOf("?")) : "");
    const lang = urlParams.get("lang");
    renderCategoryPage("languages", lang, appRoot);
    return;
  }

  // Pattern 3: Industries -> #/industries or #/industries?ind=Hallyu
  if (hash.startsWith("#/industries")) {
    const urlParams = new URLSearchParams(hash.includes("?") ? hash.substring(hash.indexOf("?")) : "");
    const ind = urlParams.get("ind");
    renderCategoryPage("industries", ind, appRoot);
    return;
  }

  // Pattern 4: Search Results -> #/search?q=term
  if (hash.startsWith("#/search")) {
    const urlParams = new URLSearchParams(hash.includes("?") ? hash.substring(hash.indexOf("?")) : "");
    const query = urlParams.get("q");
    renderSearchResultsPage(query, appRoot);
    return;
  }

  // Pattern 5: Trending List -> #/trending
  if (hash === "#/trending") {
    renderTrendingPage(appRoot);
    return;
  }

  // Default / Catch-all: Home Page
  renderHome(appRoot);
}

/**
 * Update navbar active states according to active routing path
 */
function updateNavbarActiveState(hash) {
  const navItems = document.querySelectorAll(".nav-item, .drawer-item");
  let activeRoute = "home";

  if (hash.startsWith("#/languages")) activeRoute = "languages";
  else if (hash.startsWith("#/industries")) activeRoute = "industries";
  else if (hash.startsWith("#/trending")) activeRoute = "trending";

  navItems.forEach(item => {
    if (item.getAttribute("data-route") === activeRoute) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Render home page layout template
 */
function renderHome(container) {
  const featuredMovies = window.movieStore.getMovies().filter(m => m.featured);
  const trendingMovies = window.movieStore.getWeeklyTrending();
  const languagesList = window.movieStore.getLanguages();
  const industriesList = window.movieStore.getIndustries();

  let html = `
    <!-- Featured Hero Slider -->
    <section class="hero-carousel" id="hero-slider-mount">
      ${featuredMovies.map((movie, idx) => `
        <div class="hero-slide ${idx === 0 ? "active" : ""}" data-slide-index="${idx}">
          <div class="hero-image-container">
            <img src="${movie.backdropUrl}" alt="${movie.title}" class="hero-backdrop">
            <div class="hero-overlay"></div>
          </div>
          <div class="hero-content">
            <div class="hero-badge-row">
              <span class="badge-outline badge-featured">Featured Hit</span>
              <span class="badge-outline">${movie.industry}</span>
              <span class="badge-outline">${movie.language}</span>
              <div class="rating-badge-group">
                <span class="rating-pill imdb"><span class="material-icons" style="font-size: 1rem;">star</span>IMDb ${movie.adjustedImdbRating || movie.imdbRating}</span>
                <span class="rating-pill rt"><span class="material-icons" style="font-size: 1rem;">favorite</span>RT ${movie.rottenTomatoes}%</span>
              </div>
            </div>
            <h1 class="hero-title">${movie.title}</h1>
            <p class="hero-synopsis">${movie.synopsis}</p>
            <div class="hero-meta">
              <span>Released: ${movie.releaseYear}</span>
              <span class="meta-divider"></span>
              <span>Genres: ${movie.genres.join(", ")}</span>
            </div>
            <div class="hero-actions">
              <a href="#/movie/${movie.id}" class="btn btn-primary">
                <span class="material-icons">info</span>
                Explore Movie Details
              </a>
              <a href="#/industries?ind=${movie.industry}" class="btn btn-secondary">
                More from ${movie.industry}
              </a>
            </div>
          </div>
        </div>
      `).join("")}

      <!-- Slider dot indicators -->
      <div class="hero-controls">
        ${featuredMovies.map((_, idx) => `
          <span class="control-dot ${idx === 0 ? "active" : ""}" data-slide-to="${idx}"></span>
        `).join("")}
      </div>
    </section>

    <!-- Weekly Trending Grid Section -->
    <section class="section container fade-in">
      <div class="section-header-row">
        <div class="section-title-group">
          <span class="section-subtitle">Trending This Week</span>
          <h2 class="section-title">Weekly Blockbusters</h2>
        </div>
        <a href="#/trending" class="section-link">
          View All Trending
          <span class="material-icons">arrow_forward</span>
        </a>
      </div>

      <div class="movie-grid">
        ${trendingMovies.slice(0, 4).map(movie => renderMovieCardMarkup(movie)).join("")}
      </div>
    </section>

    <!-- Industry Exploration Hub Section -->
    <section class="section container fade-in" style="background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%); padding: 60px 0;">
      <div class="section-header-row">
        <div class="section-title-group">
          <span class="section-subtitle">Film Sectors</span>
          <h2 class="section-title">Explore by Film Industry</h2>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        ${industriesList.map(ind => {
          let indDesc = "Cinematic masterpieces from around the globe.";
          let indIcon = "movie";
          if (ind === "Hollywood") { indDesc = "American high-budget blockbusters and legendary studios."; indIcon = "stars"; }
          else if (ind === "Bollywood") { indDesc = "India's massive vibrant Hindi-language musical romances and dramas."; indIcon = "music_note"; }
          else if (ind === "Tollywood") { indDesc = "South Indian powerhouses rich with action, mythological fantasy, and grand scales."; indIcon = "flash_on"; }
          else if (ind === "Hallyu") { indDesc = "South Korea's modern gripping thrillers and award-winning masterpieces."; indIcon = "psychology"; }
          else if (ind === "Anime") { indDesc = "Japan's beautifully hand-drawn animations and profound fantasy realms."; indIcon = "palette"; }
          else if (ind === "European Cinema") { indDesc = "Poetic, artistic cinema from France, Spain, Italy, and beyond."; indIcon = "theater_comedy"; }

          return `
            <a href="#/industries?ind=${ind}" class="platform-item" style="flex-direction: column; align-items: flex-start; gap: 16px; padding: 28px;">
              <div style="background: rgba(99,102,241,0.08); padding: 12px; border-radius: 12px;">
                <span class="material-icons platform-logo-icon">${indIcon}</span>
              </div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">${ind}</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">${indDesc}</p>
              </div>
            </a>
          `;
        }).join("")}
      </div>
    </section>

    <!-- Language Quick Filters Section -->
    <section class="section container fade-in" style="margin-bottom: 60px;">
      <div class="section-header-row">
        <div class="section-title-group">
          <span class="section-subtitle">Global Languages</span>
          <h2 class="section-title">Categorize by Language</h2>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;">
        ${languagesList.map(lang => `
          <a href="#/languages?lang=${lang}" class="btn btn-secondary" style="border-radius: var(--border-radius-xl); padding: 12px 28px;">
            <span class="material-icons" style="font-size: 1.1rem; color: var(--accent-color);">translate</span>
            ${lang} Films
          </a>
        `).join("")}
      </div>
    </section>
  `;

  container.innerHTML = html;

  // Launch slideshow interval loop (Featured Banner)
  setupHeroSlideshow();
}

/**
 * Helper to auto-cycle slides in Hero slider banner
 */
function setupHeroSlideshow() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".control-dot");
  if (slides.length <= 1) return;

  currentSlideIndex = 0;

  function goToSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add("active");
    dots[currentSlideIndex].classList.add("active");
  }

  // Click dot events
  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      const targetIndex = parseInt(e.target.getAttribute("data-slide-to"));
      goToSlide(targetIndex);
    });
  });

  // Cycle interval (5 seconds)
  slideInterval = setInterval(() => {
    let nextIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }, 5000);
}

/**
 * Generate visual markup structure for a movie card
 */
function renderMovieCardMarkup(movie) {
  const roundedRating = movie.adjustedImdbRating || movie.imdbRating;
  return `
    <article class="movie-card" onclick="window.location.hash = '#/movie/${movie.id}'">
      <span class="card-badge language">${movie.language}</span>
      <span class="card-badge industry">${movie.industry}</span>
      
      <div class="card-poster-container">
        <img src="${movie.posterUrl}" alt="${movie.title}" class="card-poster" loading="lazy">
        <div class="card-poster-overlay">
          <div class="card-overlay-btn">
            <span class="material-icons">visibility</span>
          </div>
        </div>
      </div>

      <div class="card-details">
        <div>
          <h3 class="card-title">${movie.title}</h3>
          <div class="card-meta-row">
            <span>Year: ${movie.releaseYear}</span>
            <span class="card-genres">${movie.genres[0]} • ${movie.genres[1] || movie.genres[0]}</span>
          </div>
        </div>

        <div class="card-ratings">
          <div class="card-rating-item imdb">
            <span class="material-icons" style="font-size: 0.95rem;">star</span>
            <span>IMDb ${roundedRating}</span>
          </div>
          <div class="card-rating-item rt">
            <span class="material-icons" style="font-size: 0.95rem;">favorite</span>
            <span>RT ${movie.rottenTomatoes}%</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render details page layout
 */
function renderMovieDetail(movieId, container) {
  const movie = window.movieStore.getMovieById(movieId);

  if (!movie) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 120px 0;">
        <span class="material-icons" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 20px;">error</span>
        <h2 style="font-size: 2rem; margin-bottom: 12px;">Movie Not Found</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">The specified movie listing is not in our database.</p>
        <a href="#/" class="btn btn-primary">Return to Home</a>
      </div>
    `;
    return;
  }

  // Load user ratings & aggregate details
  const displayRating = movie.adjustedImdbRating || movie.imdbRating;
  const userAvg = movie.userAverageRating ? `${movie.userAverageRating}` : "N/A";
  const userReviewsCount = movie.userReviews ? movie.userReviews.length : 0;

  let html = `
    <div class="detail-container fade-in">
      <!-- Panoramic cover canvas -->
      <div class="detail-backdrop-canvas">
        <img src="${movie.backdropUrl}" alt="${movie.title}" class="detail-backdrop-img">
      </div>

      <div class="detail-content-wrap container">
        <a href="#/" class="back-btn-link">
          <span class="material-icons">arrow_back</span>
          Back to Home
        </a>

        <div class="detail-grid">
          
          <!-- Left side layout -->
          <aside class="detail-side">
            <div class="detail-poster-card">
              <img src="${movie.posterUrl}" alt="${movie.title}">
            </div>

            <!-- Available Streaming Platforms -->
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; border-left: 3px solid var(--accent-color); padding-left: 10px;">Available On</h3>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${movie.platforms.map(p => `
                  <div class="platform-item" style="padding: 10px 16px; border-radius: var(--border-radius-sm);">
                    <span class="material-icons platform-logo-icon" style="font-size: 1.25rem;">${p.icon}</span>
                    <span style="font-size: 0.9rem;">${p.name}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </aside>

          <!-- Right side layout -->
          <main class="detail-main">
            <div class="detail-header">
              <h1 class="detail-title">${movie.title}</h1>
              
              <div class="detail-meta-list">
                <span class="badge-outline" style="border-color: var(--accent-color); color: #a5b4fc; background: rgba(99, 102, 241, 0.05);">${movie.industry}</span>
                <span class="badge-outline">${movie.language}</span>
                <span class="meta-divider"></span>
                <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">${movie.releaseYear}</span>
                <span class="meta-divider"></span>
                <div class="detail-genre-pills">
                  ${movie.genres.map(g => `<span class="genre-pill">${g}</span>`).join("")}
                </div>
              </div>
            </div>

            <!-- Custom Ratings Cards -->
            <div class="detail-ratings-row">
              <div class="detail-rating-card">
                <p class="rating-card-label">IMDb Rating</p>
                <div class="rating-card-score imdb">
                  <span class="material-icons" style="font-size: 2rem;">star</span>
                  <span>${displayRating}</span>
                  <span class="rating-card-scale">/10</span>
                </div>
              </div>
              
              <div class="detail-rating-card">
                <p class="rating-card-label">Rotten Tomatoes</p>
                <div class="rating-card-score rt">
                  <span class="material-icons" style="font-size: 2rem;">favorite</span>
                  <span>${movie.rottenTomatoes}</span>
                  <span class="rating-card-scale">%</span>
                </div>
              </div>

              <div class="detail-rating-card">
                <p class="rating-card-label">CineSphere Community</p>
                <div class="rating-card-score cinesphere">
                  <span class="material-icons" style="font-size: 2rem;">forum</span>
                  <span>${userAvg}</span>
                  <span class="rating-card-scale">${movie.userAverageRating ? `/10 (${movie.userRatingCount})` : ""}</span>
                </div>
              </div>
            </div>

            <!-- Details Tabs system -->
            <div class="detail-tabs">
              <button class="tab-btn active" data-tab="synopsis">Overview</button>
              <button class="tab-btn" data-tab="critic-reviews">Critic Reviews (${movie.criticReviews.length})</button>
              <button class="tab-btn" data-tab="user-reviews">User Reviews (${userReviewsCount})</button>
            </div>

            <!-- Tab Panels Content -->
            <!-- Tab 1: Synopsis & platforms -->
            <div class="tab-panel active" id="tab-synopsis">
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 12px;">Synopsis</h3>
              <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.8; margin-bottom: 32px;">${movie.synopsis}</p>
            </div>

            <!-- Tab 2: Critic reviews -->
            <div class="tab-panel" id="tab-critic-reviews">
              <div class="reviews-list">
                ${movie.criticReviews.map(r => `
                  <div class="review-card">
                    <div class="review-card-header">
                      <div>
                        <h4 class="reviewer-name">${r.criticName}</h4>
                        <p class="reviewer-pub">${r.publication}</p>
                      </div>
                      <span class="reviewer-badge">${r.score}% Rating</span>
                    </div>
                    <p class="review-card-body">"${r.quote}"</p>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Tab 3: User reviews -->
            <div class="tab-panel" id="tab-user-reviews">
              <div class="reviews-list" id="user-reviews-mount-list">
                ${movie.userReviews && movie.userReviews.length > 0 ? 
                  movie.userReviews.map(r => `
                    <div class="review-card">
                      <div class="review-card-header">
                        <div>
                          <h4 class="reviewer-name">${r.criticName}</h4>
                          <p class="reviewer-pub">${r.date}</p>
                        </div>
                        <span class="reviewer-badge" style="background: rgba(16, 185, 129, 0.12); color: #6ee7b7;">${r.score / 10} / 10 Rating</span>
                      </div>
                      <p class="review-card-body">"${r.quote}"</p>
                    </div>
                  `).join("") 
                  : `<div class="no-reviews-msg">Be the first to review "${movie.title}". Share your unique cinematic experience!</div>`
                }
              </div>

              <!-- Interactive Review Form widget -->
              <div class="user-rating-interaction">
                <h3 class="interaction-title">Write a Review for ${movie.title}</h3>
                
                <form id="user-review-form" onsubmit="event.preventDefault(); submitUserReview('${movie.id}');">
                  <!-- Star controller -->
                  <div class="rating-stars-control">
                    <span class="stars-label">Your Personal Score:</span>
                    <div class="star-interactive-row" id="star-interactive-mount">
                      ${Array.from({ length: 10 }).map((_, idx) => `
                        <span class="material-icons star-interactive" data-star-value="${idx + 1}">star_border</span>
                      `).join("")}
                      <span class="star-selection-value" id="star-count-indicator">Select Rating</span>
                    </div>
                  </div>

                  <div class="review-form-fields">
                    <div class="form-group">
                      <label class="form-label" for="review-author">Your Name</label>
                      <input type="text" id="review-author" class="input-field" placeholder="e.g. Jean-Luc Godard" required autocomplete="off">
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label" for="review-body">Your Detailed Review</label>
                      <textarea id="review-body" class="input-field textarea-field" placeholder="What makes this film extraordinary? Analyze cinematography, pacing, acting performances, or emotional delivery..." required></textarea>
                    </div>

                    <div style="margin-top: 8px;">
                      <button type="submit" class="btn btn-primary">
                        <span class="material-icons">publish</span>
                        Publish Review
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </main>
        </div>

        <!-- Recommended Movies Grid -->
        <section class="recommended-section">
          <h2 class="section-title" style="font-size: 1.8rem; margin-bottom: 24px; border-left: 4px solid var(--accent-color); padding-left: 14px;">Recommended Recommendations</h2>
          <div class="movie-grid">
            ${window.movieStore.getMovies()
              .filter(m => m.id !== movie.id && (m.industry === movie.industry || m.language === movie.language))
              .slice(0, 4)
              .map(recMovie => renderMovieCardMarkup(recMovie))
              .join("")}
          </div>
        </section>

      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind Tab switching logic
  setupDetailTabs();

  // Bind Star Interactive Controls
  setupStarInteraction();
}

/**
 * Handle Tab switches in details page
 */
function setupDetailTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(`tab-${tab.getAttribute("data-tab")}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

/**
 * Handle hover / select states of star-rating interaction widget
 */
function setupStarInteraction() {
  const stars = document.querySelectorAll(".star-interactive");
  const indicator = document.getElementById("star-count-indicator");
  activeStarsSelected = 0; // reset state

  stars.forEach((star, idx) => {
    // Hover event
    star.addEventListener("mouseenter", () => {
      stars.forEach((s, i) => {
        if (i <= idx) {
          s.textContent = "star";
          s.classList.add("active");
        } else {
          s.textContent = "star_border";
          s.classList.remove("active");
        }
      });
      indicator.textContent = `${idx + 1} / 10`;
    });

    // Hover leave (reset to selected value if any)
    star.addEventListener("mouseleave", () => {
      stars.forEach((s, i) => {
        if (i < activeStarsSelected) {
          s.textContent = "star";
          s.classList.add("active");
        } else {
          s.textContent = "star_border";
          s.classList.remove("active");
        }
      });
      indicator.textContent = activeStarsSelected > 0 ? `${activeStarsSelected} / 10` : "Select Rating";
    });

    // Click event
    star.addEventListener("click", () => {
      activeStarsSelected = idx + 1;
      stars.forEach((s, i) => {
        if (i < activeStarsSelected) {
          s.textContent = "star";
          s.classList.add("active");
        } else {
          s.textContent = "star_border";
          s.classList.remove("active");
        }
      });
      indicator.textContent = `${activeStarsSelected} / 10`;
    });
  });
}

/**
 * Handle form submissions for user reviews
 */
function submitUserReview(movieId) {
  const authorField = document.getElementById("review-author");
  const bodyField = document.getElementById("review-body");

  const name = authorField.value.trim();
  const content = bodyField.value.trim();

  if (activeStarsSelected === 0) {
    alert("Please select a star score rating from 1 to 10.");
    return;
  }

  // Persist to store
  window.movieStore.addReview(movieId, name, content, activeStarsSelected);

  // Clear inputs
  authorField.value = "";
  bodyField.value = "";
  activeStarsSelected = 0;

  // Success notify
  alert("Review published successfully! Your rating has updated the CineSphere aggregate score.");

  // Reactive Re-render detail view smoothly
  const appRoot = document.getElementById("app-root");
  renderMovieDetail(movieId, appRoot);
  
  // Set third tab ("User Reviews") active
  const userTabBtn = document.querySelector('.tab-btn[data-tab="user-reviews"]');
  if (userTabBtn) {
    userTabBtn.click();
  }
}

/**
 * Render category pages (Languages / Industries)
 */
function renderCategoryPage(filterType, selectedValue, container) {
  const isLanguage = filterType === "languages";
  const storeFilterList = isLanguage ? window.movieStore.getLanguages() : window.movieStore.getIndustries();
  
  // Choose default value if none is selected
  const activeValue = selectedValue || storeFilterList[0];

  const filteredMovies = isLanguage 
    ? window.movieStore.getMoviesByLanguage(activeValue)
    : window.movieStore.getMoviesByIndustry(activeValue);

  let html = `
    <div class="container fade-in" style="padding-top: 40px; padding-bottom: 80px;">
      
      <div class="category-intro">
        <span class="section-subtitle">${isLanguage ? "Language Collections" : "Industry Collectives"}</span>
        <h1 class="category-intro-title">${isLanguage ? `${activeValue} Cinema` : activeValue}</h1>
        <p class="category-intro-desc">
          ${isLanguage 
            ? `Browse our handpicked cinematic masterpieces produced in the ${activeValue} language.` 
            : `Discover premium storytelling from the core of ${activeValue} filmmakers and productions.`
          }
        </p>
      </div>

      <!-- Pill selectors hub -->
      <div class="category-filter-hub">
        ${storeFilterList.map(val => `
          <button class="filter-pill ${val.toLowerCase() === activeValue.toLowerCase() ? "active" : ""}" 
            onclick="location.hash = '#/${filterType}?${isLanguage ? "lang" : "ind"}=${val}'">
            ${val} (${isLanguage ? window.movieStore.getMoviesByLanguage(val).length : window.movieStore.getMoviesByIndustry(val).length})
          </button>
        `).join("")}
      </div>

      <!-- Active Grid dynamic list -->
      <div class="movie-grid">
        ${filteredMovies.length > 0 
          ? filteredMovies.map(movie => renderMovieCardMarkup(movie)).join("")
          : `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-style: italic; padding: 60px 0;">No movies found under this category filter.</div>`
        }
      </div>

    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render weekly trending page view
 */
function renderTrendingPage(container) {
  const trendingMovies = window.movieStore.getWeeklyTrending();

  let html = `
    <div class="container fade-in" style="padding-top: 40px; padding-bottom: 80px;">
      <div class="category-intro" style="margin-bottom: 48px;">
        <span class="section-subtitle">Trending This Week</span>
        <h1 class="category-intro-title">Weekly Blockbusters</h1>
        <p class="category-intro-desc">The most popular, highly reviewed, and viral films capturing audiences across the globe this week.</p>
      </div>

      <div class="movie-grid">
        ${trendingMovies.map(movie => renderMovieCardMarkup(movie)).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Setup Global Interactive Search components
 */
function initSearch() {
  const searchInput = document.getElementById("global-search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const resultsOverlay = document.getElementById("search-results-overlay");
  const resultsContent = document.getElementById("search-overlay-content");

  // Instant filtering on keystrokes
  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.trim();

    if (val.length === 0) {
      clearBtn.classList.add("hidden");
      resultsOverlay.classList.add("hidden");
      return;
    }

    clearBtn.classList.remove("hidden");
    const matches = window.movieStore.searchMovies(val);

    if (matches.length === 0) {
      resultsContent.innerHTML = `
        <div style="padding: 16px; color: var(--text-muted); font-style: italic; font-size: 0.85rem; text-align: center;">
          No direct matches found...
        </div>
      `;
    } else {
      resultsContent.innerHTML = matches.slice(0, 5).map(m => `
        <a href="#/movie/${m.id}" class="search-result-item" onclick="document.getElementById('search-results-overlay').classList.add('hidden'); document.getElementById('global-search-input').value = ''; document.getElementById('clear-search-btn').classList.add('hidden');">
          <img src="${m.posterUrl}" class="search-result-thumb" alt="${m.title}">
          <div class="search-result-info">
            <h4 class="search-result-title">${m.title}</h4>
            <p class="search-result-meta">${m.releaseYear} • ${m.language} (${m.industry})</p>
          </div>
          <div class="search-result-rating">
            <span class="material-icons" style="font-size: 0.85rem;">star</span>
            <span>${m.adjustedImdbRating || m.imdbRating}</span>
          </div>
        </a>
      `).join("");
    }

    resultsOverlay.classList.remove("hidden");
  });

  // Handle Enter key for full search results page
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const val = searchInput.value.trim();
      if (val.length > 0) {
        resultsOverlay.classList.add("hidden");
        window.location.hash = `#/search?q=${encodeURIComponent(val)}`;
      }
    }
  });

  // Close search overlay clicking outside search container
  document.addEventListener("click", (e) => {
    const searchContainer = document.getElementById("global-search-container");
    if (!searchContainer.contains(e.target)) {
      resultsOverlay.classList.add("hidden");
    }
  });

  // Clear button click trigger
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    resultsOverlay.classList.add("hidden");
    searchInput.focus();
  });
}

/**
 * Render full Search Results list
 */
function renderSearchResultsPage(query, container) {
  const matches = window.movieStore.searchMovies(query);

  let html = `
    <div class="container fade-in" style="padding-top: 40px; padding-bottom: 80px;">
      <div class="category-intro" style="margin-bottom: 48px;">
        <span class="section-subtitle">Search Results</span>
        <h1 class="category-intro-title">Matches for "${query}"</h1>
        <p class="category-intro-desc">We discovered ${matches.length} matching films matching your terms across titles, synopses, languages, and genres.</p>
      </div>

      <div class="movie-grid">
        ${matches.length > 0 
          ? matches.map(movie => renderMovieCardMarkup(movie)).join("")
          : `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
              <span class="material-icons" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 16px;">search_off</span>
              <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No Movies Found</h3>
              <p style="color: var(--text-secondary); margin-bottom: 24px;">Try searching for other tags e.g. "Sci-Fi", "Tamil", "Hollywood", "Inception".</p>
              <a href="#/" class="btn btn-primary">Return to Home</a>
            </div>
          `
        }
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Handle Hamburger mobile menu sliding drawer triggers
 */
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const closeBtn = document.getElementById("close-drawer-btn");
  const drawer = document.getElementById("mobile-drawer-menu");
  const overlay = document.getElementById("mobile-drawer-overlay");
  const drawerItems = document.querySelectorAll(".drawer-item");

  function openMenu() {
    drawer.classList.add("open");
    overlay.classList.add("active");
  }

  function closeMenu() {
    drawer.classList.remove("open");
    overlay.classList.remove("active");
  }

  btn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  // Close drawer on clicking menu items
  drawerItems.forEach(item => {
    item.addEventListener("click", closeMenu);
  });
}
