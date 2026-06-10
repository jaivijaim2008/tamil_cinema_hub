from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from contextlib import asynccontextmanager
import logging
import json
import gc
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

df = None
tfidf_matrix = None
slugs_to_idx = {}
rec_cache = {} # Simple in-memory cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, tfidf_matrix, slugs_to_idx, rec_cache
    try:
        data_path = 'movies.json'
        if not os.path.exists(data_path):
            logger.error(f"{data_path} not found.")
            yield
            return

        with open(data_path, 'r', encoding='utf-8') as f:
            raw = json.load(f)
        
        if not raw:
            logger.error("movies.json is empty.")
            yield
            return

        df = pd.DataFrame(raw)

        # ── Data Normalization ──
        df['genre'] = df['genre'].apply(lambda x: x if isinstance(x, list) else [])
        
        def normalize_cast(items):
            if not isinstance(items, list): return []
            return [item.get('name', '') if isinstance(item, dict) else str(item) for item in items if item]

        df['cast'] = df['cast'].apply(normalize_cast)
        df['director'] = df['director'].apply(lambda x: str(x).lower().strip() if pd.notna(x) else 'unknown')
        df['title'] = df['title'].apply(lambda x: str(x) if pd.notna(x) else 'untitled')
        df['synopsis'] = df['synopsis'].apply(lambda x: str(x).lower() if pd.notna(x) else '')
        df['year'] = df['year'].apply(lambda x: int(x) if pd.notna(x) else 0)
        df['slug'] = df['slug'].apply(lambda x: str(x) if pd.notna(x) else '')

        # ── Feature Engineering ──
        # We weigh genres more by repeating them, and add synopsis for context
        df['features'] = (
            df['genre'].apply(lambda x: ' '.join(x * 2)) + ' ' + 
            df['director'] + ' ' + 
            df['cast'].apply(lambda x: ' '.join(x)) + ' ' +
            df['synopsis'].apply(lambda x: ' '.join(x.split()[:50])) # First 50 words of synopsis
        )

        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform(df['features'])
        
        # Free up memory
        del df["features"]
        slugs_to_idx = {slug: idx for idx, slug in enumerate(df['slug'])}
        rec_cache = {}

        del vectorizer
        gc.collect()
        logger.info(f"Loaded {len(df)} movies successfully (enhanced mode)")

    except Exception as e:
        logger.error(f"Failed to load movie data: {e}")

    yield

    df = None
    tfidf_matrix = None
    slugs_to_idx = {}
    rec_cache = {}
    gc.collect()

app = FastAPI(
    title="KollywoodAI Recommendation Engine",
    description="Tamil movie recommendation API",
    version="1.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    if df is None or tfidf_matrix is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")
    return {"status": "ok", "movies_loaded": len(df)}

@app.get("/recommend/{movie_slug}")
def recommend(
    movie_slug: str,
    n: int = Query(default=6, ge=1, le=20)
):
    if df is None or tfidf_matrix is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")

    if movie_slug not in slugs_to_idx:
        raise HTTPException(status_code=404, detail=f"Movie '{movie_slug}' not found")

    # Check cache
    cache_key = f"{movie_slug}_{n}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    idx = slugs_to_idx[movie_slug]
    movie_vector = tfidf_matrix[idx:idx+1]
    
    # Compute similarity
    scores = cosine_similarity(movie_vector, tfidf_matrix).flatten()
    
    # Get top N excluding the movie itself
    top_indices = np.argsort(scores)[::-1][1:n+1]

    recommendations = []
    for i in top_indices:
        recommendations.append({
            "title": df.iloc[i]['title'],
            "slug": df.iloc[i]['slug'],
            "year": int(df.iloc[i]['year']),
            "score": round(float(scores[i]), 2)
        })

    result = {
        "movie": movie_slug,
        "total_results": len(recommendations),
        "recommendations": recommendations
    }
    
    # Save to cache
    rec_cache[cache_key] = result
    return result

@app.get("/movies")
def list_movies(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100)
):
    if df is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")

    start = (page - 1) * limit
    end = start + limit
    slice = df.iloc[start:end]

    return {
        "page": page,
        "limit": limit,
        "total_movies": len(df),
        "movies": [
            {
                "title": row['title'],
                "slug": row['slug'],
                "year": int(row['year'])
            }
            for _, row in slice.iterrows()
        ]
    }

@app.post("/reload")
def reload_data():
    # This would ideally trigger the lifespan again or a similar reload logic
    # For simplicity, we just clear the cache here if the file changed
    global rec_cache
    rec_cache = {}
    return {"message": "Cache cleared"}
