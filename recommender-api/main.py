from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from contextlib import asynccontextmanager
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model data
df = None
similarity = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load data once when server starts (not on every request)
    global df, similarity
    try:
        # Read with explicit UTF-8 to avoid Windows cp1252 issues
        with open('movies.json', 'r', encoding='utf-8') as f:
            raw = json.load(f)
        df = pd.DataFrame(raw)

        # Handle missing values safely
        df['genre']    = df['genre'].apply(lambda x: x if isinstance(x, list) else [])
        # Cast can be strings OR objects with {name, character, photo, tmdbPersonId}
        def normalize_cast(items):
            if not isinstance(items, list):
                return []
            names = []
            for item in items:
                if isinstance(item, dict):
                    names.append(item.get('name', ''))
                elif isinstance(item, str):
                    names.append(item)
            return [n for n in names if n]
        df['cast'] = df['cast'].apply(normalize_cast)
        df['director'] = df['director'].apply(lambda x: str(x) if pd.notna(x) else 'unknown')
        df['title']    = df['title'].apply(lambda x: str(x) if pd.notna(x) else 'untitled')
        df['year']     = df['year'].apply(lambda x: int(x) if pd.notna(x) else 0)
        df['slug']     = df['slug'].apply(lambda x: str(x) if pd.notna(x) else '')

        # Build feature string for each movie
        df['features'] = (
            df['genre'].apply(lambda x: ' '.join(x)) + ' ' +
            df['director'] + ' ' +
            df['cast'].apply(lambda x: ' '.join(x))
        )

        # Build similarity matrix
        vectorizer = TfidfVectorizer(stop_words='english')
        feature_matrix = vectorizer.fit_transform(df['features'])
        similarity = cosine_similarity(feature_matrix)

        logger.info(f"Loaded {len(df)} movies successfully")

    except FileNotFoundError:
        logger.error("movies.json not found. Please add the file and restart.")
    except Exception as e:
        logger.error(f"Failed to load movie data: {e}")

    yield  # Server runs here

    # Cleanup on shutdown
    df = None
    similarity = None
    logger.info("Server shut down, data cleared.")

app = FastAPI(
    title="KollywoodAI Recommendation Engine",
    description="Tamil movie recommendation API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Change to your frontend URL in production
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    """Check if the server and data are ready."""
    if df is None or similarity is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")
    return {
        "status": "ok",
        "movies_loaded": len(df)
    }

@app.get("/recommend/{movie_slug}")
def recommend(
    movie_slug: str,
    n: int = Query(default=6, ge=1, le=20)  # n must be between 1 and 20
):
    """Get similar movie recommendations for a given movie slug."""

    # Check if data is loaded
    if df is None or similarity is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded. Check server logs.")

    # Check if movie exists
    matches = df[df['slug'] == movie_slug]
    if matches.empty:
        raise HTTPException(status_code=404, detail=f"Movie '{movie_slug}' not found")

    idx = matches.index[0]

    # Get similarity scores, sort by highest
    scores = list(enumerate(similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    # Skip index 0 (the movie itself), take next n
    top_n = scores[1:n + 1]

    recommendations = []
    for i, score in top_n:
        recommendations.append({
            "title":    df.iloc[i]['title'],
            "slug":     df.iloc[i]['slug'],
            "year":     int(df.iloc[i]['year']),
            "score":    round(float(score), 2)
        })

    return {
        "movie":           movie_slug,
        "total_results":   len(recommendations),
        "recommendations": recommendations
    }

@app.get("/movies")
def list_movies(
    page: int  = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100)
):
    """List all movies with pagination."""
    if df is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")

    start = (page - 1) * limit
    end   = start + limit
    slice = df.iloc[start:end]

    return {
        "page":         page,
        "limit":        limit,
        "total_movies": len(df),
        "movies": [
            {
                "title": row['title'],
                "slug":  row['slug'],
                "year":  int(row['year'])
            }
            for _, row in slice.iterrows()
        ]
    }

# Run with: uvicorn main:app --reload