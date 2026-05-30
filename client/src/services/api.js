const API_BASE_URL = 'http://localhost:5001/api';

export async function getMovies() {
  const response = await fetch(`${API_BASE_URL}/movies`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  return response.json();
}

export async function getMovieById(id) {
  const response = await fetch(`${API_BASE_URL}/movies/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch movie details');
  }
  return response.json();
}

export async function postReview(movieId, authorName, reviewContent, stars) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authorName, reviewContent, stars }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to post review');
  }
  return response.json();
}

export async function getLanguages() {
  const response = await fetch(`${API_BASE_URL}/languages`);
  if (!response.ok) {
    throw new Error('Failed to fetch languages');
  }
  return response.json();
}

export async function getIndustries() {
  const response = await fetch(`${API_BASE_URL}/industries`);
  if (!response.ok) {
    throw new Error('Failed to fetch industries');
  }
  return response.json();
}
