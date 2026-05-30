const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'cinesphere.db');

const INITIAL_MOVIES = [
  {
    id: "inception",
    title: "Inception",
    releaseYear: 2010,
    genres: ["Sci-Fi", "Action", "Thriller"],
    language: "English",
    industry: "Hollywood",
    imdbRating: 8.8,
    rottenTomatoes: 87,
    trendingThisWeek: 1,
    featured: 1,
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Netflix", icon: "play_circle" },
      { name: "Prime Video", icon: "shop" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    criticReviews: [
      {
        criticName: "Roger Ebert",
        publication: "Chicago Sun-Times",
        score: 100,
        quote: "A breathtaking, mind-bending adventure. Christopher Nolan is a master storyteller of our generation."
      },
      {
        criticName: "Peter Travers",
        publication: "Rolling Stone",
        score: 90,
        quote: "Nolan matches the audacity of his concepts with sheer cinematic wizardry. DiCaprio is phenomenal."
      },
      {
        criticName: "Kenneth Turan",
        publication: "LA Times",
        score: 85,
        quote: "If you want a movie that challenges your intellect while serving up dazzling action, Inception is it."
      }
    ]
  },
  {
    id: "parasite",
    title: "Parasite",
    releaseYear: 2019,
    genres: ["Thriller", "Drama", "Comedy"],
    language: "Korean",
    industry: "Hallyu",
    imdbRating: 8.5,
    rottenTomatoes: 99,
    trendingThisWeek: 1,
    featured: 1,
    posterUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Hulu", icon: "play_circle" },
      { name: "Max", icon: "movie" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    criticReviews: [
      {
        criticName: "Manohla Dargis",
        publication: "The New York Times",
        score: 100,
        quote: "A masterpiece of social commentary, brilliant pacing, and unpredictable genre shifts. Simply extraordinary."
      },
      {
        criticName: "Justin Chang",
        publication: "LA Times",
        score: 98,
        quote: "Bong Joon Ho's dark comedy thriller is a devastating indictment of capitalist complacency."
      },
      {
        criticName: "David Edelstein",
        publication: "Vulture",
        score: 95,
        quote: "So tight, so perfectly executed that it feels less like a film and more like a beautifully ticking bomb."
      }
    ]
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    releaseYear: 2001,
    genres: ["Animation", "Fantasy", "Adventure"],
    language: "Japanese",
    industry: "Anime",
    imdbRating: 8.6,
    rottenTomatoes: 96,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Max", icon: "movie" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    criticReviews: [
      {
        criticName: "Leonard Maltin",
        publication: "IndieWire",
        score: 100,
        quote: "An enchanting fairy tale that stands alongside the greatest animated works in cinematic history."
      },
      {
        criticName: "A.O. Scott",
        publication: "The New York Times",
        score: 95,
        quote: "Miyazaki creates a dreamscape so lush and emotionally true that you never want to wake up from it."
      }
    ]
  },
  {
    id: "rrr",
    title: "RRR",
    releaseYear: 2022,
    genres: ["Action", "Drama", "Adventure"],
    language: "Tamil",
    industry: "Tollywood",
    imdbRating: 7.8,
    rottenTomatoes: 95,
    trendingThisWeek: 1,
    featured: 1,
    posterUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Netflix", icon: "play_circle" },
      { name: "Prime Video", icon: "shop" }
    ],
    synopsis: "A fearless warrior on a perilous mission comes face-to-face with a steely cop serving British forces in this epic saga set in pre-independent India.",
    criticReviews: [
      {
        criticName: "David Fear",
        publication: "Rolling Stone",
        score: 90,
        quote: "An absolute visual blast that puts Hollywood action filmmaking to shame. Truly spectacular."
      },
      {
        criticName: "Siddhant Adlakha",
        publication: "IGN",
        score: 88,
        quote: "S.S. Rajamouli's maximalist masterpiece is a celebration of action, friendship, and cinematic heroism."
      }
    ]
  },
  {
    id: "dangal",
    title: "Dangal",
    releaseYear: 2016,
    genres: ["Biography", "Drama", "Sport"],
    language: "Hindi",
    industry: "Bollywood",
    imdbRating: 8.3,
    rottenTomatoes: 88,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Apple TV", icon: "tv" },
      { name: "Prime Video", icon: "shop" }
    ],
    synopsis: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
    criticReviews: [
      {
        criticName: "Taran Adarsh",
        publication: "Bollywood Hungama",
        score: 95,
        quote: "A colossal achievement. Aamir Khan delivers a career-best performance in this emotionally rich sports drama."
      },
      {
        criticName: "Mike McCahill",
        publication: "The Guardian",
        score: 80,
        quote: "A solid, deeply moving crowd-pleaser that successfully balances sports action with family emotions."
      }
    ]
  },
  {
    id: "pans-labyrinth",
    title: "Pan's Labyrinth",
    releaseYear: 2006,
    genres: ["Fantasy", "Drama", "War"],
    language: "Spanish",
    industry: "European Cinema",
    imdbRating: 8.2,
    rottenTomatoes: 95,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "In the Falangist Spain of 1944, the young stepdaughter of a sadistic army officer escapes into a eerie but captivating fantasy world.",
    criticReviews: [
      {
        criticName: "Mark Kermode",
        publication: "Observer",
        score: 100,
        quote: "Guillermo del Toro's dark fairy tale is a beautifully realized, deeply affecting cinematic miracle."
      },
      {
        criticName: "AO Scott",
        publication: "NY Times",
        score: 95,
        quote: "A rich, terrifying, and deeply moving study of fascism, power, and the magic of childhood escape."
      }
    ]
  },
  {
    id: "the-intouchables",
    title: "The Intouchables",
    releaseYear: 2011,
    genres: ["Comedy", "Drama", "Biography"],
    language: "French",
    industry: "European Cinema",
    imdbRating: 8.5,
    rottenTomatoes: 76,
    trendingThisWeek: 1,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver.",
    criticReviews: [
      {
        criticName: "Richard Roeper",
        publication: "Chicago Sun-Times",
        score: 90,
        quote: "An irresistible feel-good film grounded by two magnificent, deeply charismatic central performances."
      },
      {
        criticName: "Boyd van Hoeij",
        publication: "Variety",
        score: 80,
        quote: "A beautifully balanced mix of comedy and high drama that touches the soul without being overly sentimental."
      }
    ]
  },
  {
    id: "your-name",
    title: "Your Name.",
    releaseYear: 2016,
    genres: ["Animation", "Romance", "Drama", "Fantasy"],
    language: "Japanese",
    industry: "Anime",
    imdbRating: 8.4,
    rottenTomatoes: 98,
    trendingThisWeek: 1,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Crunchyroll", icon: "play_circle" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?",
    criticReviews: [
      {
        criticName: "Mark Schilling",
        publication: "The Japan Times",
        score: 100,
        quote: "Makoto Shinkai achieves cinematic perfection. The animation is gorgeous, and the narrative is deeply emotional."
      },
      {
        criticName: "Robbie Collin",
        publication: "The Telegraph",
        score: 95,
        quote: "A beautiful, sweeping romantic drama that will leave you absolutely spellbound."
      }
    ]
  },
  {
    id: "baahubali-2",
    title: "Baahubali 2: The Conclusion",
    releaseYear: 2017,
    genres: ["Action", "Drama", "Fantasy"],
    language: "Tamil",
    industry: "Tollywood",
    imdbRating: 8.2,
    rottenTomatoes: 87,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Netflix", icon: "play_circle" },
      { name: "Disney+", icon: "star" }
    ],
    synopsis: "When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom.",
    criticReviews: [
      {
        criticName: "Anupama Chopra",
        publication: "Film Companion",
        score: 90,
        quote: "Rajamouli scales new peaks of imagination. An absolute visual feast with massive emotional beats."
      },
      {
        criticName: "Simon Abrams",
        publication: "RogerEbert.com",
        score: 85,
        quote: "A gloriously bombastic, emotionally satisfying cinematic event that is a joy to behold."
      }
    ]
  },
  {
    id: "three-idiots",
    title: "3 Idiots",
    releaseYear: 2009,
    genres: ["Comedy", "Drama"],
    language: "Hindi",
    industry: "Bollywood",
    imdbRating: 8.4,
    rottenTomatoes: 100,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" }
    ],
    synopsis: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.",
    criticReviews: [
      {
        criticName: "Subhash K. Jha",
        publication: "The Times of India",
        score: 100,
        quote: "A masterpiece that balances social commentary on the education system with brilliant comedy."
      },
      {
        criticName: "Rachel Saltz",
        publication: "The New York Times",
        score: 90,
        quote: "A cheerful, high-spirited film that has genuine heart and makes points that resonate globally."
      }
    ]
  },
  {
    id: "interstellar",
    title: "Interstellar",
    releaseYear: 2014,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    language: "English",
    industry: "Hollywood",
    imdbRating: 8.7,
    rottenTomatoes: 73,
    trendingThisWeek: 1,
    featured: 1,
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Paramount+", icon: "play_circle" },
      { name: "Prime Video", icon: "shop" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    criticReviews: [
      {
        criticName: "Richard Roeper",
        publication: "Chicago Sun-Times",
        score: 95,
        quote: "An eye-popping, spectacular space epic that is grounded by a powerful father-daughter love story."
      },
      {
        criticName: "Todd McCarthy",
        publication: "The Hollywood Reporter",
        score: 88,
        quote: "A massive, visual tour de force that tackles big ideas and delivers intense, cosmic suspense."
      }
    ]
  },
  {
    id: "train-to-busan",
    title: "Train to Busan",
    releaseYear: 2016,
    genres: ["Action", "Horror", "Thriller"],
    language: "Korean",
    industry: "Hallyu",
    imdbRating: 7.6,
    rottenTomatoes: 94,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" },
      { name: "Peacock", icon: "star" }
    ],
    synopsis: "While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.",
    criticReviews: [
      {
        criticName: "Jeannette Catsoulis",
        publication: "The New York Times",
        score: 92,
        quote: "A relentless, terrifying ride that manages to find profound humanity and emotion amid the chaos."
      },
      {
        criticName: "Clark Collis",
        publication: "Entertainment Weekly",
        score: 85,
        quote: "A first-class zombie thriller. The action sequences are inventive, high-octane, and extremely tense."
      }
    ]
  },
  {
    id: "spider-verse",
    title: "Spider-Man: Into the Spider-Verse",
    releaseYear: 2018,
    genres: ["Animation", "Action", "Adventure"],
    language: "English",
    industry: "Hollywood",
    imdbRating: 8.4,
    rottenTomatoes: 97,
    trendingThisWeek: 1,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Disney+", icon: "star" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    criticReviews: [
      {
        criticName: "David Ehrlich",
        publication: "IndieWire",
        score: 100,
        quote: "The best superhero film ever made. The animation style is revolutionary and incredibly gorgeous."
      },
      {
        criticName: "Justin Chang",
        publication: "LA Times",
        score: 95,
        quote: "A vibrant, funny, and deeply emotional comic book movie that is a total joy to watch."
      }
    ]
  },
  {
    id: "amelie",
    title: "Amélie",
    releaseYear: 2001,
    genres: ["Romance", "Comedy"],
    language: "French",
    industry: "European Cinema",
    imdbRating: 8.3,
    rottenTomatoes: 89,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
    criticReviews: [
      {
        criticName: "Roger Ebert",
        publication: "Chicago Sun-Times",
        score: 95,
        quote: "It's a delicious, lighthearted fantasy. Audrey Tautou is completely capturing and delightful."
      },
      {
        criticName: "Elvis Mitchell",
        publication: "The New York Times",
        score: 90,
        quote: "A whimsical, visually dazzling romantic comedy that spreads absolute warmth and joy."
      }
    ]
  },
  {
    id: "ddlj",
    title: "Dilwale Dulhania Le Jayenge",
    releaseYear: 1995,
    genres: ["Romance", "Drama", "Musical"],
    language: "Hindi",
    industry: "Bollywood",
    imdbRating: 8.0,
    rottenTomatoes: 91,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" }
    ],
    synopsis: "Raj and Simran meet on a trip to Europe. While Raj falls in love with Simran, she is already promised to another man back in India.",
    criticReviews: [
      {
        criticName: "Anupama Chopra",
        publication: "India Today",
        score: 95,
        quote: "The definitive romance of Indian cinema. Shah Rukh Khan and Kajol make screen magic."
      },
      {
        criticName: "Rachel Saltz",
        publication: "NY Times",
        score: 85,
        quote: "A milestone in Hindi cinema that defined romance, family dynamics, and NRI identity for a generation."
      }
    ]
  },
  {
    id: "jai-bhim",
    title: "Jai Bhim",
    releaseYear: 2021,
    genres: ["Crime", "Drama", "Mystery"],
    language: "Tamil",
    industry: "Tollywood",
    imdbRating: 8.7,
    rottenTomatoes: 100,
    trendingThisWeek: 1,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1505664194779-8bebcb3fdd27?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Prime Video", icon: "shop" }
    ],
    synopsis: "When a tribal man is arrested for a case of alleged theft, his wife subverts societal hierarchies to seek justice. She turns to a human-rights lawyer, Advocate Chandru, to file a Habeas Corpus petition.",
    criticReviews: [
      {
        criticName: "Sowmya Rajendran",
        publication: "The News Minute",
        score: 100,
        quote: "An honest, searing indictment of institutional oppression. Suriya gives a powerhouse performance."
      },
      {
        criticName: "Saibal Chatterjee",
        publication: "NDTV",
        score: 90,
        quote: "A devastatingly powerful court drama that does not flinch. An essential piece of Indian cinema."
      }
    ]
  },
  {
    id: "princess-mononoke",
    title: "Princess Mononoke",
    releaseYear: 1997,
    genres: ["Animation", "Adventure", "Fantasy"],
    language: "Japanese",
    industry: "Anime",
    imdbRating: 8.4,
    rottenTomatoes: 93,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Max", icon: "movie" },
      { name: "Apple TV", icon: "tv" }
    ],
    synopsis: "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony. In this quest he also meets San, the Mononoke Hime.",
    criticReviews: [
      {
        criticName: "Roger Ebert",
        publication: "Chicago Sun-Times",
        score: 100,
        quote: "One of the most spectacular, emotionally complex films ever created. A majestic epic of nature and humanity."
      },
      {
        criticName: "Kenneth Turan",
        publication: "LA Times",
        score: 95,
        quote: "A masterpiece of moral complexity and environmental urgency, visually staggering in scope."
      }
    ]
  },
  {
    id: "roma",
    title: "Roma",
    releaseYear: 2018,
    genres: ["Drama"],
    language: "Spanish",
    industry: "European Cinema",
    imdbRating: 7.7,
    rottenTomatoes: 96,
    trendingThisWeek: 0,
    featured: 0,
    posterUrl: "https://images.unsplash.com/photo-1486848538113-ce1a4923fbc5?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    platforms: [
      { name: "Netflix", icon: "play_circle" }
    ],
    synopsis: "A year in the life of a middle-class family's maid in Mexico City in the early 1970s.",
    criticReviews: [
      {
        criticName: "Peter Bradshaw",
        publication: "The Guardian",
        score: 100,
        quote: "Alfonso Cuarón has crafted a masterpiece of profound empathy and staggeringly beautiful cinematography."
      },
      {
        criticName: "A.O. Scott",
        publication: "The New York Times",
        score: 98,
        quote: "A masterpiece of memory and scale, turning a quiet domestic story into a colossal visual poem."
      }
    ]
  }
];

async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

async function initDb() {
  const db = await getDb();

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      releaseYear INTEGER NOT NULL,
      language TEXT NOT NULL,
      industry TEXT NOT NULL,
      imdbRating REAL NOT NULL,
      rottenTomatoes INTEGER NOT NULL,
      trendingThisWeek INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      posterUrl TEXT,
      backdropUrl TEXT,
      synopsis TEXT
    );

    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movieId TEXT,
      name TEXT NOT NULL,
      FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movieId TEXT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS critic_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movieId TEXT,
      criticName TEXT NOT NULL,
      publication TEXT NOT NULL,
      score INTEGER NOT NULL,
      quote TEXT NOT NULL,
      FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movieId TEXT,
      criticName TEXT NOT NULL,
      score INTEGER NOT NULL,
      quote TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // Check if seeding is necessary
  const count = await db.get("SELECT COUNT(*) as count FROM movies");
  if (count.count === 0) {
    console.log("Seeding SQLite database with default movie collection...");

    for (const m of INITIAL_MOVIES) {
      await db.run(
        `INSERT INTO movies (id, title, releaseYear, language, industry, imdbRating, rottenTomatoes, trendingThisWeek, featured, posterUrl, backdropUrl, synopsis)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.title,
          m.releaseYear,
          m.language,
          m.industry,
          m.imdbRating,
          m.rottenTomatoes,
          m.trendingThisWeek,
          m.featured,
          m.posterUrl,
          m.backdropUrl,
          m.synopsis,
        ]
      );

      for (const g of m.genres) {
        await db.run("INSERT INTO genres (movieId, name) VALUES (?, ?)", [m.id, g]);
      }

      for (const p of m.platforms) {
        await db.run("INSERT INTO platforms (movieId, name, icon) VALUES (?, ?, ?)", [m.id, p.name, p.icon]);
      }

      for (const r of m.criticReviews) {
        await db.run(
          "INSERT INTO critic_reviews (movieId, criticName, publication, score, quote) VALUES (?, ?, ?, ?, ?)",
          [m.id, r.criticName, r.publication, r.score, r.quote]
        );
      }
    }
    console.log("Seeding completed successfully!");
  }

  return db;
}

module.exports = {
  getDb,
  initDb
};
