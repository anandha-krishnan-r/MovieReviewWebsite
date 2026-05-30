# 🎬 CineSphere — Discover Extraordinary Cinema

Welcome to **CineSphere**, a premium, visually stunning Single Page Application (SPA) designed for cinephiles to explore the world's finest cinema. Discover top-rated movies, explore ratings (IMDb & Rotten Tomatoes), filter by language or industry, and engage with comprehensive film reviews.

---

## 🌟 Key Features

- **Premium Glassmorphic UI**: Beautiful, dark-mode design with smooth gradients, harmonized color palettes, and responsive glassmorphism.
- **Dynamic Single Page Application (SPA)**: Custom client-side router supporting key sections:
  - 🏠 **Home**: Explore featured movies and perform advanced searches.
  - 🌐 **Languages**: Filter titles by language.
  - 🏢 **Industries**: Browse diverse global cinemas including Hollywood, Bollywood, Tollywood, Hallyu (Korean), and Anime.
  - 🔥 **Trending**: Check out weekly trending curation.
- **Instant Search Overlay**: Start typing in the global search bar for interactive auto-suggestions and instant results.
- **Critique & Ratings**: View aggregated scores from Rotten Tomatoes and IMDb, alongside detailed critic/user review insights.
- **Fully Responsive**: Tailored layouts that adapt gracefully to mobile, tablet, and desktop screens with an interactive mobile drawer navigation.

---

## 🛠️ Tech Stack

This project is built using modern front-end best practices with a zero-dependency architecture:

- **HTML5**: Semantic tags, accessible forms, and unique identifiers.
- **Vanilla CSS**: Advanced CSS custom properties (variables), Flexbox, CSS Grid, and custom animations.
- **Vanilla JavaScript (ES6+)**: Custom dynamic DOM generation, custom hash-based routing, instant search algorithm, and state management.

---

## 🚀 How to Run the Project

Since CineSphere is a zero-dependency, pure front-end application, there are multiple easy ways to run it:

### Option 1: Open Directly in Browser (Easiest)
Simply double-click the `index.html` file or drag it into any modern web browser (Chrome, Firefox, Safari, Edge) to run it immediately.

### Option 2: Using VS Code Live Server (Recommended)
If you are using **Visual Studio Code**:
1. Open the project folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Click the **Go Live** button at the bottom-right status bar, or right-click `index.html` and select **Open with Live Server**.

### Option 3: Local Command-Line Servers
You can launch a lightweight web server from your terminal:

**Using Node.js (`npx`):**
```bash
npx serve .
```

**Using Python:**
```bash
# For Python 3.x
python -m http.server 8000

# For Python 2.x
python -m SimpleHTTPServer 8000
```
Then, open your browser and navigate to `http://localhost:8000`.

---

## 📁 Repository Structure

```text
├── index.html     # Application entrypoint & premium layout
├── styles.css     # CSS custom variables, glassmorphic themes, and responsive design
├── app.js         # Core application shell, SPA router, and interactive UI logic
└── data.js        # Rich dataset of movie collections, reviews, and metadata
```
