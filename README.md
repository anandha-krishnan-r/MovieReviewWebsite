# 🎬 CineSphere — Full-Stack Movie Review & Discovery Application

Welcome to **CineSphere**, a premium, visually stunning web application for cinephiles to explore global cinema. Originally a static site, this is now a full-stack production-grade application featuring a modular React.js frontend, a robust Express backend API, and a relational SQLite database.

---

## 🌟 Key Features

- **Premium Glassmorphic UI**: High-fidelity dark mode with micro-animations, custom palettes, and responsive design.
- **Node.js & Express REST API**: Highly decoupled API layer facilitating CRUD mechanics for films, categories, reviews, and platform channels.
- **SQLite Database Integration**: Stored locally in a relational database format. Seeding operates automatically upon initial setup.
- **Dynamic React Router SPA**: Fast navigation with standard client-side state router preserving original hash paths (`#/`, `#/movie/:id`, etc.).
- **Interactive Autocomplete & Search**: Quick autocomplete results dynamically fetched from local memory synced with the SQLite database.
- **Interactive Critic & Community Reviews**: Aggregated user reviews dynamically updating CineSphere community scores and adjusting combined IMDb metrics instantly.

---

## 🛠️ Tech Stack

### Backend Server (`server/`)
- **Node.js** & **Express**
- **SQLite3** & **sqlite** (Promise wrapper)
- **CORS** middleware

### Frontend SPA (`client/`)
- **React 19**
- **Vite** (Next-generation bundler with Hot Module Replacement)
- **Vanilla CSS** (Custom CSS variables, grid, flex, custom keyframes)

---

## 🚀 How to Run the Project

Running the CineSphere full-stack application locally requires starting both the backend server and the frontend dev server.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

---

### Step 1: Start the Backend Server
Open a terminal and navigate to the `server/` directory:

```bash
cd server
npm install
npm run dev
```

The Express server will initialize, automatically seed the SQLite database `cinesphere.db` with the collection of 18 global movies, and start listening on:
👉 **`http://localhost:5001`**

---

### Step 2: Start the Frontend Application
Open a new terminal window or tab, and navigate to the `client/` directory:

```bash
cd client
npm install
npm run dev
```

Vite will boot up the React application in milliseconds:
👉 **`http://localhost:5173`**

Open `http://localhost:5173` in your browser to experience CineSphere!

---

## 📁 Repository Structure

```text
├── client/              # React.js Vite Frontend
│   ├── index.html       # HTML entrypoint & CDN links
│   ├── src/
│   │   ├── services/    # api.js API client interface
│   │   ├── App.jsx      # Main React application & SPA routing
│   │   ├── index.css    # Premium glassmorphic styles
│   │   └── main.jsx     # DOM bootstrap
│   └── package.json
│
├── server/              # Node.js Express Backend
│   ├── server.js        # API endpoints & controller application
│   ├── database.js      # Schema definition & database seeding logic
│   └── package.json
```
