const express = require('express');
const cors = require('cors');
const { initDb, getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper function to aggregate ratings for a list of movies
async function getAggregatedMovies(db, filterClause = "", params = []) {
  const movies = await db.all(`SELECT * FROM movies ${filterClause}`, params);
  
  for (const movie of movies) {
    // Get genres
    const genres = await db.all("SELECT name FROM genres WHERE movieId = ?", [movie.id]);
    movie.genres = genres.map(g => g.name);

    // Get platforms
    const platforms = await db.all("SELECT name, icon FROM platforms WHERE movieId = ?", [movie.id]);
    movie.platforms = platforms;

    // Get user reviews to calculate aggregate averages
    const userReviews = await db.all("SELECT score FROM user_reviews WHERE movieId = ?", [movie.id]);
    
    if (userReviews.length > 0) {
      const totalUserScore = userReviews.reduce((acc, r) => acc + (r.score / 10), 0); // user_reviews stores score out of 100 for consistency, so convert to 10
      const userAvg = Number((totalUserScore / userReviews.length).toFixed(1));
      
      movie.userAverageRating = userAvg;
      movie.userRatingCount = userReviews.length;
      movie.adjustedImdbRating = Number(((movie.imdbRating * 10 + userAvg * userReviews.length) / (10 + userReviews.length)).toFixed(1));
    } else {
      movie.userAverageRating = null;
      movie.userRatingCount = 0;
      movie.adjustedImdbRating = movie.imdbRating;
    }
  }

  return movies;
}

// 1. Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const db = await getDb();
    const movies = await getAggregatedMovies(db);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve movies" });
  }
});

// 2. Get movie details by ID
app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const movie = await db.get("SELECT * FROM movies WHERE id = ?", [id]);
    
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Get genres
    const genres = await db.all("SELECT name FROM genres WHERE movieId = ?", [id]);
    movie.genres = genres.map(g => g.name);

    // Get platforms
    movie.platforms = await db.all("SELECT name, icon FROM platforms WHERE movieId = ?", [id]);

    // Get critic reviews
    movie.criticReviews = await db.all("SELECT criticName, publication, score, quote FROM critic_reviews WHERE movieId = ?", [id]);

    // Get user reviews
    movie.userReviews = await db.all("SELECT criticName, score, quote, date FROM user_reviews WHERE movieId = ? ORDER BY id DESC", [id]);

    // Calculate aggregates
    if (movie.userReviews.length > 0) {
      const totalUserScore = movie.userReviews.reduce((acc, r) => acc + (r.score / 10), 0);
      const userAvg = Number((totalUserScore / movie.userReviews.length).toFixed(1));
      
      movie.userAverageRating = userAvg;
      movie.userRatingCount = movie.userReviews.length;
      movie.adjustedImdbRating = Number(((movie.imdbRating * 10 + userAvg * movie.userReviews.length) / (10 + movie.userReviews.length)).toFixed(1));
    } else {
      movie.userAverageRating = null;
      movie.userRatingCount = 0;
      movie.adjustedImdbRating = movie.imdbRating;
    }

    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve movie details" });
  }
});

// 3. Post a user review/rating
app.post('/api/movies/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { authorName, reviewContent, stars } = req.body;

  if (!authorName || !reviewContent || !stars) {
    return res.status(400).json({ error: "Missing required fields: authorName, reviewContent, stars" });
  }

  const ratingScore = Math.max(1, Math.min(10, Number(stars)));
  const scaledScore = ratingScore * 10; // score stored out of 100 in review tables

  try {
    const db = await getDb();
    const movieExists = await db.get("SELECT 1 FROM movies WHERE id = ?", [id]);
    
    if (!movieExists) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Insert user review
    await db.run(
      "INSERT INTO user_reviews (movieId, criticName, score, quote, date) VALUES (?, ?, ?, ?, ?)",
      [id, authorName.trim(), scaledScore, reviewContent.trim(), dateStr]
    );

    // Fetch updated movie details and return
    const movie = await db.get("SELECT * FROM movies WHERE id = ?", [id]);
    const genres = await db.all("SELECT name FROM genres WHERE movieId = ?", [id]);
    movie.genres = genres.map(g => g.name);
    movie.platforms = await db.all("SELECT name, icon FROM platforms WHERE movieId = ?", [id]);
    movie.criticReviews = await db.all("SELECT criticName, publication, score, quote FROM critic_reviews WHERE movieId = ?", [id]);
    movie.userReviews = await db.all("SELECT criticName, score, quote, date FROM user_reviews WHERE movieId = ? ORDER BY id DESC", [id]);

    const totalUserScore = movie.userReviews.reduce((acc, r) => acc + (r.score / 10), 0);
    const userAvg = Number((totalUserScore / movie.userReviews.length).toFixed(1));
    movie.userAverageRating = userAvg;
    movie.userRatingCount = movie.userReviews.length;
    movie.adjustedImdbRating = Number(((movie.imdbRating * 10 + userAvg * movie.userReviews.length) / (10 + movie.userReviews.length)).toFixed(1));

    res.status(201).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to post review" });
  }
});

// 4. Get dynamic list of unique languages
app.get('/api/languages', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.all("SELECT DISTINCT language FROM movies ORDER BY language");
    const languages = result.map(r => r.language);
    res.json(languages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve languages" });
  }
});

// 5. Get dynamic list of unique industries
app.get('/api/industries', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.all("SELECT DISTINCT industry FROM movies ORDER BY industry");
    const industries = result.map(r => r.industry);
    res.json(industries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve industries" });
  }
});

// Initialize DB and start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CineSphere Express server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database: ", err);
});
