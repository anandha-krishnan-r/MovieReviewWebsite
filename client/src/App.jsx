import React, { useState, useEffect, useRef } from 'react';
import * as api from './services/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Router State
  const [hash, setHash] = useState(window.location.hash || '#/');

  // UI States
  const [searchVal, setSearchVal] = useState('');
  const [searchMatches, setSearchMatches] = useState([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      setMobileMenuOpen(false); // Close drawer on route change
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesList, langList, indList] = await Promise.all([
        api.getMovies(),
        api.getLanguages(),
        api.getIndustries()
      ]);
      setMovies(moviesList);
      setLanguages(langList);
      setIndustries(indList);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load data from CineSphere servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle outside click for search overlay
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchOverlay(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Instant Autocomplete Search Logic
  useEffect(() => {
    if (searchVal.trim().length === 0) {
      setSearchMatches([]);
      setShowSearchOverlay(false);
      return;
    }

    const q = searchVal.toLowerCase().trim();
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(q) ||
      movie.synopsis.toLowerCase().includes(q) ||
      movie.language.toLowerCase().includes(q) ||
      movie.industry.toLowerCase().includes(q) ||
      movie.genres.some(genre => genre.toLowerCase().includes(q))
    );

    setSearchMatches(filtered.slice(0, 5));
    setShowSearchOverlay(true);
  }, [searchVal, movies]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchVal.trim().length > 0) {
      setShowSearchOverlay(false);
      window.location.hash = `#/search?q=${encodeURIComponent(searchVal.trim())}`;
      setSearchVal('');
    }
  };

  // Determine Active Nav Route
  let activeRoute = 'home';
  if (hash.startsWith('#/languages')) activeRoute = 'languages';
  else if (hash.startsWith('#/industries')) activeRoute = 'industries';
  else if (hash.startsWith('#/trending')) activeRoute = 'trending';

  // Render Loader
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050508', color: '#fff' }}>
        <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--accent-color)', animation: 'spin 2s linear infinite' }}>sync</span>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', marginTop: '16px' }}>CineSphere is loading...</h2>
      </div>
    );
  }

  // Render Router Screens
  let screenComponent = null;

  if (hash.startsWith('#/movie/')) {
    const movieId = hash.replace('#/movie/', '');
    screenComponent = <MovieDetailScreen movieId={movieId} movies={movies} onRefresh={loadData} />;
  } else if (hash.startsWith('#/languages')) {
    const urlParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?')) : '');
    const lang = urlParams.get('lang');
    screenComponent = <CategoryScreen type="languages" activeVal={lang} list={languages} movies={movies} />;
  } else if (hash.startsWith('#/industries')) {
    const urlParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?')) : '');
    const ind = urlParams.get('ind');
    screenComponent = <CategoryScreen type="industries" activeVal={ind} list={industries} movies={movies} />;
  } else if (hash.startsWith('#/search')) {
    const urlParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?')) : '');
    const query = urlParams.get('q');
    screenComponent = <SearchScreen query={query} movies={movies} />;
  } else if (hash === '#/trending') {
    screenComponent = <TrendingScreen movies={movies} />;
  } else {
    screenComponent = <HomeScreen movies={movies} languages={languages} industries={industries} />;
  }

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Glassmorphic Header */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="#/" className="logo" id="nav-logo">
            <span className="material-icons logo-icon">movie</span>
            CineSphere
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="nav-links">
            <a href="#/" className={`nav-item ${activeRoute === 'home' ? 'active' : ''}`} data-route="home">Home</a>
            <a href="#/languages" className={`nav-item ${activeRoute === 'languages' ? 'active' : ''}`} data-route="languages">Languages</a>
            <a href="#/industries" className={`nav-item ${activeRoute === 'industries' ? 'active' : ''}`} data-route="industries">Industries</a>
            <a href="#/trending" className={`nav-item ${activeRoute === 'trending' ? 'active' : ''}`} data-route="trending">Trending</a>
          </nav>

          {/* Integrated Search */}
          <div className="search-container" id="global-search-container" ref={searchContainerRef}>
            <span className="material-icons search-icon">search</span>
            <input 
              type="text" 
              id="global-search-input" 
              placeholder="Search movies, genres, language..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              autoComplete="off"
            />
            {searchVal && (
              <button id="clear-search-btn" className="clear-btn" onClick={() => setSearchVal('')}>
                <span className="material-icons">close</span>
              </button>
            )}

            {/* Instant Results Overlay */}
            {showSearchOverlay && (
              <div id="search-results-overlay" className="search-overlay">
                <div className="search-overlay-header">Instant Results</div>
                <div id="search-overlay-content" className="search-overlay-list">
                  {searchMatches.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>
                      No direct matches found...
                    </div>
                  ) : (
                    searchMatches.map(m => (
                      <a 
                        key={m.id}
                        href={`#/movie/${m.id}`} 
                        className="search-result-item" 
                        onClick={() => {
                          setShowSearchOverlay(false);
                          setSearchVal('');
                        }}
                      >
                        <img src={m.posterUrl} className="search-result-thumb" alt={m.title} />
                        <div className="search-result-info">
                          <h4 className="search-result-title">{m.title}</h4>
                          <p className="search-result-meta">{m.releaseYear} • {m.language} ({m.industry})</p>
                        </div>
                        <div className="search-result-rating">
                          <span className="material-icons" style={{ fontSize: '0.85rem' }}>star</span>
                          <span>{m.adjustedImdbRating || m.imdbRating}</span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
                <div className="search-overlay-footer">
                  Press Enter for advanced search
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
            <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} id="mobile-drawer-menu" style={{ display: mobileMenuOpen ? 'block' : 'none' }}>
        <div className="drawer-header">
          <span className="drawer-title">CineSphere</span>
          <button className="close-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <nav className="drawer-nav">
          <a href="#/" className={`drawer-item ${activeRoute === 'home' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#/languages" className={`drawer-item ${activeRoute === 'languages' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Languages</a>
          <a href="#/industries" className={`drawer-item ${activeRoute === 'industries' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Industries</a>
          <a href="#/trending" className={`drawer-item ${activeRoute === 'trending' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Trending</a>
        </nav>
      </div>
      {mobileMenuOpen && <div className="drawer-overlay" style={{ display: 'block', opacity: 1 }} onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Dynamic SPA Screen Mount Point */}
      <main id="app-root" style={{ flexGrow: 1, paddingBottom: '60px' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '120px 20px', color: '#ff4b4b' }}>
            <span className="material-icons" style={{ fontSize: '4rem', marginBottom: '20px' }}>cloud_off</span>
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadData} style={{ marginTop: '20px' }}>Retry Connection</button>
          </div>
        ) : (
          screenComponent
        )}
      </main>

      {/* Premium Cinematic Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="logo">
              <span className="material-icons logo-icon">movie</span>
              CineSphere
            </div>
            <p className="footer-tagline">Connecting cinephiles worldwide with legendary works of cinema. Dive into curated excellence.</p>
            <div className="social-links">
              <a href="#" className="social-badge" aria-label="Twitter"><span className="material-icons">alternate_email</span></a>
              <a href="#" className="social-badge" aria-label="YouTube"><span className="material-icons">smart_display</span></a>
              <a href="#" className="social-badge" aria-label="Instagram"><span className="material-icons">photo_camera</span></a>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h3 className="footer-header">Explore Categories</h3>
              <ul className="footer-list">
                <li><a href="#/languages">Languages</a></li>
                <li><a href="#/industries">Film Industries</a></li>
                <li><a href="#/trending">Trending Weekly</a></li>
                <li><a href="#/">Featured Hits</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-header">Industries</h3>
              <ul className="footer-list">
                <li><a href="#/industries">Hollywood</a></li>
                <li><a href="#/industries">Bollywood</a></li>
                <li><a href="#/industries">Tollywood</a></li>
                <li><a href="#/industries">Hallyu (Korean)</a></li>
                <li><a href="#/industries">Anime</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h3 className="footer-header">Stay Updated</h3>
            <p className="newsletter-text">Join the CineSphere weekly newsletter for exclusive curations, festival summaries, and review features.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to CineSphere Newsletter!'); e.target.reset(); }}>
              <input type="email" placeholder="Your email address" required aria-label="Newsletter email input" />
              <button type="submit" className="btn btn-primary" aria-label="Subscribe">
                <span className="material-icons">send</span>
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">&copy; 2026 CineSphere Inc. Designed with premium visual aesthetics for film lovers.</p>
          <div className="footer-policy-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Content License</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// SCREEN 1: HOME SCREEN
// ----------------------------------------------------
function HomeScreen({ movies, languages, industries }) {
  const featuredMovies = movies.filter(m => m.featured);
  const trendingMovies = movies.filter(m => m.trendingThisWeek);
  const [slideIdx, setSlideIdx] = useState(0);

  // Hero Slider Autoplay
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIdx(prev => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredMovies]);

  return (
    <>
      {/* Hero Slideshow */}
      <section className="hero-carousel">
        {featuredMovies.map((movie, idx) => (
          <div key={movie.id} className={`hero-slide ${idx === slideIdx ? 'active' : ''}`} style={{ display: idx === slideIdx ? 'block' : 'none' }}>
            <div className="hero-image-container">
              <img src={movie.backdropUrl} alt={movie.title} className="hero-backdrop" />
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
              <div className="hero-badge-row">
                <span className="badge-outline badge-featured">Featured Hit</span>
                <span className="badge-outline">{movie.industry}</span>
                <span className="badge-outline">{movie.language}</span>
                <div className="rating-badge-group">
                  <span className="rating-pill imdb"><span className="material-icons" style={{ fontSize: '1rem' }}>star</span>IMDb {movie.adjustedImdbRating || movie.imdbRating}</span>
                  <span className="rating-pill rt"><span className="material-icons" style={{ fontSize: '1rem' }}>favorite</span>RT {movie.rottenTomatoes}%</span>
                </div>
              </div>
              <h1 className="hero-title">{movie.title}</h1>
              <p className="hero-synopsis">{movie.synopsis}</p>
              <div className="hero-meta">
                <span>Released: {movie.releaseYear}</span>
                <span className="meta-divider"></span>
                <span>Genres: {movie.genres.join(", ")}</span>
              </div>
              <div className="hero-actions">
                <a href={`#/movie/${movie.id}`} className="btn btn-primary">
                  <span className="material-icons">info</span>
                  Explore Movie Details
                </a>
                <a href={`#/industries?ind=${movie.industry}`} className="btn btn-secondary">
                  More from {movie.industry}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="hero-controls">
          {featuredMovies.map((_, idx) => (
            <span 
              key={idx} 
              className={`control-dot ${idx === slideIdx ? 'active' : ''}`}
              onClick={() => setSlideIdx(idx)}
            ></span>
          ))}
        </div>
      </section>

      {/* Weekly Blockbusters Grid */}
      <section className="section container fade-in">
        <div className="section-header-row">
          <div className="section-title-group">
            <span className="section-subtitle">Trending This Week</span>
            <h2 className="section-title">Weekly Blockbusters</h2>
          </div>
          <a href="#/trending" className="section-link">
            View All Trending
            <span className="material-icons">arrow_forward</span>
          </a>
        </div>

        <div className="movie-grid">
          {trendingMovies.slice(0, 4).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Explore by Industry Sectors */}
      <section className="section container fade-in" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%)', padding: '60px 0' }}>
        <div className="section-header-row">
          <div className="section-title-group">
            <span className="section-subtitle">Film Sectors</span>
            <h2 className="section-title">Explore by Film Industry</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {industries.map(ind => {
            let indDesc = "Cinematic masterpieces from around the globe.";
            let indIcon = "movie";
            if (ind === "Hollywood") { indDesc = "American high-budget blockbusters and legendary studios."; indIcon = "stars"; }
            else if (ind === "Bollywood") { indDesc = "India's massive vibrant Hindi-language musical romances and dramas."; indIcon = "music_note"; }
            else if (ind === "Tollywood") { indDesc = "South Indian powerhouses rich with action, mythological fantasy, and grand scales."; indIcon = "flash_on"; }
            else if (ind === "Hallyu") { indDesc = "South Korea's modern gripping thrillers and award-winning masterpieces."; indIcon = "psychology"; }
            else if (ind === "Anime") { indDesc = "Japan's beautifully hand-drawn animations and profound fantasy realms."; indIcon = "palette"; }
            else if (ind === "European Cinema") { indDesc = "Poetic, artistic cinema from France, Spain, Italy, and beyond."; indIcon = "theater_comedy"; }

            return (
              <a key={ind} href={`#/industries?ind=${ind}`} className="platform-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px', padding: '28px' }}>
                <div style={{ background: 'rgba(99,102,241,0.08)', padding: '12px', borderRadius: '12px' }}>
                  <span className="material-icons platform-logo-icon">{indIcon}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{ind}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{indDesc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Language Quick Filters */}
      <section className="section container fade-in" style={{ marginBottom: '60px' }}>
        <div className="section-header-row">
          <div className="section-title-group">
            <span className="section-subtitle">Global Languages</span>
            <h2 className="section-title">Categorize by Language</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          {languages.map(lang => (
            <a key={lang} href={`#/languages?lang=${lang}`} className="btn btn-secondary" style={{ borderRadius: 'var(--border-radius-xl)', padding: '12px 28px' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginRight: '6px' }}>translate</span>
              {lang} Films
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

// ----------------------------------------------------
// SCREEN 2: MOVIE CARD COMPONENT
// ----------------------------------------------------
function MovieCard({ movie }) {
  const roundedRating = movie.adjustedImdbRating || movie.imdbRating;
  return (
    <article className="movie-card" onClick={() => window.location.hash = `#/movie/${movie.id}`}>
      <span className="card-badge language">{movie.language}</span>
      <span className="card-badge industry">{movie.industry}</span>
      
      <div className="card-poster-container">
        <img src={movie.posterUrl} alt={movie.title} className="card-poster" loading="lazy" />
        <div className="card-poster-overlay">
          <div className="card-overlay-btn">
            <span className="material-icons">visibility</span>
          </div>
        </div>
      </div>

      <div className="card-details">
        <div>
          <h3 className="card-title">{movie.title}</h3>
          <div className="card-meta-row">
            <span>Year: {movie.releaseYear}</span>
            <span className="card-genres">{movie.genres[0]} • {movie.genres[1] || movie.genres[0]}</span>
          </div>
        </div>

        <div className="card-ratings">
          <div className="card-rating-item imdb">
            <span className="material-icons" style={{ fontSize: '0.95rem' }}>star</span>
            <span>IMDb {roundedRating}</span>
          </div>
          <div className="card-rating-item rt">
            <span className="material-icons" style={{ fontSize: '0.95rem' }}>favorite</span>
            <span>RT {movie.rottenTomatoes}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ----------------------------------------------------
// SCREEN 3: MOVIE DETAIL SCREEN
// ----------------------------------------------------
function MovieDetailScreen({ movieId, movies, onRefresh }) {
  const [movie, setMovie] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('synopsis');
  
  // Star rating interaction states
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  const fetchMovieDetails = async () => {
    try {
      setFetching(true);
      const data = await api.getMovieById(movieId);
      setMovie(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    // Scroll to top
    window.scrollTo(0, 0);
  }, [movieId]);

  if (fetching) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center', color: '#fff' }}>
        <span className="material-icons" style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>sync</span>
        <p style={{ marginTop: '10px' }}>Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '20px' }}>error</span>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Movie Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The specified movie listing is not in our database.</p>
        <a href="#/" className="btn btn-primary">Return to Home</a>
      </div>
    );
  }

  const displayRating = movie.adjustedImdbRating || movie.imdbRating;
  const userAvg = movie.userAverageRating ? `${movie.userAverageRating}` : "N/A";
  const userReviewsCount = movie.userReviews ? movie.userReviews.length : 0;

  // Filter recommendations
  const recommendations = movies
    .filter(m => m.id !== movie.id && (m.industry === movie.industry || m.language === movie.language))
    .slice(0, 4);

  // Submit Community Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (selectedRating === 0) {
      alert("Please select a star score rating from 1 to 10.");
      return;
    }

    try {
      const updatedMovie = await api.postReview(movie.id, authorName, reviewContent, selectedRating);
      setMovie(updatedMovie);
      setAuthorName('');
      setReviewContent('');
      setSelectedRating(0);
      alert("Review published successfully! Your rating has updated the CineSphere aggregate score.");
      setActiveTab('user-reviews');
      onRefresh(); // Refresh general list
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  return (
    <div className="detail-container fade-in">
      {/* Backdrop cover */}
      <div className="detail-backdrop-canvas">
        <img src={movie.backdropUrl} alt={movie.title} className="detail-backdrop-img" />
      </div>

      <div className="detail-content-wrap container">
        {/* Back to Home Button */}
        <a href="#/" className="back-btn-link">
          <span className="material-icons">arrow_back</span>
          Back to Home
        </a>

        <div className="detail-grid">
          {/* Left Poster & Info */}
          <aside className="detail-side">
            <div className="detail-poster-card">
              <img src={movie.posterUrl} alt={movie.title} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', borderLeft: '3px solid var(--accent-color)', paddingLeft: '10px' }}>Available On</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {movie.platforms.map((p, i) => (
                  <div key={i} className="platform-item" style={{ padding: '10px 16px', borderRadius: 'var(--border-radius-sm)' }}>
                    <span className="material-icons platform-logo-icon" style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                    <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Movie Details */}
          <main className="detail-main">
            <div className="detail-header">
              <h1 className="detail-title">{movie.title}</h1>
              
              <div className="detail-meta-list">
                <span className="badge-outline" style={{ borderColor: 'var(--accent-color)', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.05)' }}>{movie.industry}</span>
                <span className="badge-outline">{movie.language}</span>
                <span className="meta-divider"></span>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{movie.releaseYear}</span>
                <span className="meta-divider"></span>
                <div className="detail-genre-pills">
                  {movie.genres.map(g => <span key={g} className="genre-pill">{g}</span>)}
                </div>
              </div>
            </div>

            {/* Ratings Row */}
            <div className="detail-ratings-row">
              <div className="detail-rating-card">
                <p className="rating-card-label">IMDb Rating</p>
                <div className="rating-card-score imdb">
                  <span className="material-icons" style={{ fontSize: '2rem' }}>star</span>
                  <span>{displayRating}</span>
                  <span className="rating-card-scale">/10</span>
                </div>
              </div>
              
              <div className="detail-rating-card">
                <p className="rating-card-label">Rotten Tomatoes</p>
                <div className="rating-card-score rt">
                  <span className="material-icons" style={{ fontSize: '2rem' }}>favorite</span>
                  <span>{movie.rottenTomatoes}</span>
                  <span className="rating-card-scale">%</span>
                </div>
              </div>

              <div className="detail-rating-card">
                <p className="rating-card-label">CineSphere Community</p>
                <div className="rating-card-score cinesphere">
                  <span className="material-icons" style={{ fontSize: '2rem' }}>forum</span>
                  <span>{userAvg}</span>
                  <span className="rating-card-scale">{movie.userAverageRating ? `/10 (${movie.userRatingCount})` : ''}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <button className={`tab-btn ${activeTab === 'synopsis' ? 'active' : ''}`} onClick={() => setActiveTab('synopsis')}>Overview</button>
              <button className={`tab-btn ${activeTab === 'critic-reviews' ? 'active' : ''}`} onClick={() => setActiveTab('critic-reviews')}>Critic Reviews ({movie.criticReviews?.length || 0})</button>
              <button className={`tab-btn ${activeTab === 'user-reviews' ? 'active' : ''}`} onClick={() => setActiveTab('user-reviews')}>User Reviews ({userReviewsCount})</button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'synopsis' && (
              <div className="tab-panel active">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Synopsis</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '32px' }}>{movie.synopsis}</p>
              </div>
            )}

            {/* Tab 2: Critic Reviews */}
            {activeTab === 'critic-reviews' && (
              <div className="tab-panel active">
                <div className="reviews-list">
                  {movie.criticReviews.map((r, idx) => (
                    <div key={idx} className="review-card">
                      <div className="review-card-header">
                        <div>
                          <h4 className="reviewer-name">{r.criticName}</h4>
                          <p className="reviewer-pub">{r.publication}</p>
                        </div>
                        <span className="reviewer-badge">{r.score}% Rating</span>
                      </div>
                      <p className="review-card-body">"{r.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: User Reviews */}
            {activeTab === 'user-reviews' && (
              <div className="tab-panel active">
                <div className="reviews-list">
                  {movie.userReviews && movie.userReviews.length > 0 ? (
                    movie.userReviews.map((r, idx) => (
                      <div key={idx} className="review-card">
                        <div className="review-card-header">
                          <div>
                            <h4 className="reviewer-name">{r.criticName}</h4>
                            <p className="reviewer-pub">{r.date}</p>
                          </div>
                          <span className="reviewer-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#6ee7b7' }}>{r.score / 10} / 10 Rating</span>
                        </div>
                        <p className="review-card-body">"{r.quote}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews-msg">Be the first to review "{movie.title}". Share your unique cinematic experience!</div>
                  )}
                </div>

                {/* Review Form */}
                <div className="user-rating-interaction">
                  <h3 className="interaction-title">Write a Review for {movie.title}</h3>
                  
                  <form onSubmit={handleSubmitReview}>
                    <div className="rating-stars-control">
                      <span className="stars-label">Your Personal Score:</span>
                      <div className="star-interactive-row">
                        {Array.from({ length: 10 }).map((_, idx) => {
                          const starValue = idx + 1;
                          const isActive = starValue <= (hoverRating || selectedRating);
                          return (
                            <span 
                              key={idx}
                              className={`material-icons star-interactive ${isActive ? 'active' : ''}`}
                              onMouseEnter={() => setHoverRating(starValue)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setSelectedRating(starValue)}
                            >
                              {isActive ? 'star' : 'star_border'}
                            </span>
                          );
                        })}
                        <span className="star-selection-value">
                          {selectedRating > 0 ? `${selectedRating} / 10` : 'Select Rating'}
                        </span>
                      </div>
                    </div>

                    <div className="review-form-fields">
                      <div className="form-group">
                        <label className="form-label" htmlFor="review-author">Your Name</label>
                        <input 
                          type="text" 
                          id="review-author" 
                          className="input-field" 
                          placeholder="e.g. Jean-Luc Godard" 
                          required 
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="review-body">Your Detailed Review</label>
                        <textarea 
                          id="review-body" 
                          className="input-field textarea-field" 
                          placeholder="What makes this film extraordinary? Analyze cinematography, pacing, acting performances, or emotional delivery..." 
                          required
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                        ></textarea>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary">
                          <span className="material-icons">publish</span>
                          Publish Review
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Recommended Movies */}
        {recommendations.length > 0 && (
          <section className="recommended-section">
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '24px', borderLeft: '4px solid var(--accent-color)', paddingLeft: '14px' }}>Recommended Recommendations</h2>
            <div className="movie-grid">
              {recommendations.map(recMovie => (
                <MovieCard key={recMovie.id} movie={recMovie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SCREEN 4: CATEGORY SCREEN (Languages & Industries)
// ----------------------------------------------------
function CategoryScreen({ type, activeVal, list, movies }) {
  const isLanguage = type === 'languages';
  const resolvedActiveVal = activeVal || list[0];

  const filteredMovies = movies.filter(m => {
    const val = isLanguage ? m.language : m.industry;
    return val.toLowerCase() === resolvedActiveVal?.toLowerCase();
  });

  return (
    <div className="container fade-in" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div className="category-intro">
        <span className="section-subtitle">{isLanguage ? 'Language Collections' : 'Industry Collectives'}</span>
        <h1 className="category-intro-title">{isLanguage ? `${resolvedActiveVal} Cinema` : resolvedActiveVal}</h1>
        <p className="category-intro-desc">
          {isLanguage 
            ? `Browse our handpicked cinematic masterpieces produced in the ${resolvedActiveVal} language.` 
            : `Discover premium storytelling from the core of ${resolvedActiveVal} filmmakers and productions.`
          }
        </p>
      </div>

      {/* Pill Filters */}
      <div className="category-filter-hub">
        {list.map(val => {
          const count = movies.filter(m => (isLanguage ? m.language : m.industry).toLowerCase() === val.toLowerCase()).length;
          const isActive = val.toLowerCase() === resolvedActiveVal?.toLowerCase();
          return (
            <button 
              key={val}
              className={`filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => {
                window.location.hash = `#/${type}?${isLanguage ? 'lang' : 'ind'}=${val}`;
              }}
            >
              {val} ({count})
            </button>
          );
        })}
      </div>

      {/* Movie Grid */}
      <div className="movie-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '60px 0' }}>
            No movies found under this category filter.
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SCREEN 5: SEARCH SCREEN
// ----------------------------------------------------
function SearchScreen({ query, movies }) {
  const q = query?.toLowerCase().trim() || '';

  const matches = movies.filter(movie => 
    movie.title.toLowerCase().includes(q) ||
    movie.synopsis.toLowerCase().includes(q) ||
    movie.language.toLowerCase().includes(q) ||
    movie.industry.toLowerCase().includes(q) ||
    movie.genres.some(genre => genre.toLowerCase().includes(q))
  );

  return (
    <div className="container fade-in" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div className="category-intro" style={{ marginBottom: '48px' }}>
        <span className="section-subtitle">Search Results</span>
        <h1 className="category-intro-title" style={{ fontSize: '2.4rem' }}>Results for "{query}"</h1>
        <p className="category-intro-desc">We found {matches.length} matches in our extraordinary cinematic database.</p>
      </div>

      {matches.length > 0 ? (
        <div className="movie-grid">
          {matches.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <span className="material-icons" style={{ fontSize: '4rem', marginBottom: '16px' }}>search_off</span>
          <h3>No Match Found</h3>
          <p style={{ marginTop: '8px' }}>Try using alternative keywords, film categories, or exact titles.</p>
          <a href="#/" className="btn btn-primary" style={{ marginTop: '24px' }}>Return to Home</a>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// SCREEN 6: TRENDING SCREEN
// ----------------------------------------------------
function TrendingScreen({ movies }) {
  const trendingMovies = movies.filter(m => m.trendingThisWeek);

  return (
    <div className="container fade-in" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div className="category-intro" style={{ marginBottom: '48px' }}>
        <span className="section-subtitle">Trending This Week</span>
        <h1 className="category-intro-title">Weekly Blockbusters</h1>
        <p className="category-intro-desc">The most popular, highly reviewed, and viral films capturing audiences across the globe this week.</p>
      </div>

      <div className="movie-grid">
        {trendingMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </div>
  );
}

export default App;
