"""
KollywoodAI ML Recommendation Engine v2.0
==========================================
Real machine-learning powered Tamil movie recommendation system.

Algorithms:
  1. Content-Based Filtering   – TF-IDF on genres, cast, director, synopsis
  2. Collaborative Network     – Cast/director co-occurrence graph similarity
  3. Knowledge-Based Scoring   – Year proximity, genre affinity, rating quality
  4. Ensemble Hybrid           – Weighted combination of all three signals

Endpoints:
  GET /health                         – Model health + stats
  GET /recommend/{slug}               – Similar movies for a given film
  GET /recommend/top-picks            – Curated cross-genre top picks
  GET /recommend/trending             – Recent well-rated movies
  GET /recommend/genre/{genre}        – Best movies in a genre
  GET /recommend/personalized         – Preference-weighted recs
  GET /model/info                     – Model metadata
  POST /reload                        – Clear cache
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import json
import gc
import os
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global state ──────────────────────────────────────────────────────────────
df = None
tfidf_matrix = None
content_sim_matrix = None
collab_sim_matrix = None
hybrid_sim_matrix = None
slugs_to_idx = {}
rec_cache = {}
model_info = {}


def _build_cast_director_network(movies_df: pd.DataFrame) -> np.ndarray:
    """
    Build collaborative-style similarity from cast/director co-occurrence.
    Two movies are 'collaboratively similar' if they share cast members or
    the same director, weighted by how many connections they have in common.
    """
    n = len(movies_df)
    sim = np.zeros((n, n), dtype=np.float32)

    # Director affinity
    director_groups = defaultdict(list)
    for i, row in movies_df.iterrows():
        d = row.get("director", "unknown")
        if d and d != "unknown":
            director_groups[d].append(i)

    for indices in director_groups.values():
        if len(indices) < 2:
            continue
        for a in range(len(indices)):
            for b in range(a + 1, len(indices)):
                sim[indices[a], indices[b]] += 2.0
                sim[indices[b], indices[a]] += 2.0

    # Cast affinity – each shared cast member adds 1.0
    cast_groups = defaultdict(list)
    for i, row in movies_df.iterrows():
        cast_list = row.get("cast", [])
        if isinstance(cast_list, list):
            for c in cast_list:
                name = c if isinstance(c, str) else str(c)
                name = name.strip().lower()
                if name and name != "unknown":
                    cast_groups[name].append(i)

    for indices in cast_groups.values():
        if len(indices) < 2:
            continue
        for a in range(len(indices)):
            for b in range(a + 1, len(indices)):
                sim[indices[a], indices[b]] += 1.0
                sim[indices[b], indices[a]] += 1.0

    # Normalize row-wise
    row_max = sim.max(axis=1, keepdims=True)
    row_max[row_max == 0] = 1.0
    sim = sim / row_max

    return sim


def _build_hybrid_matrix(
    content_sim: np.ndarray,
    collab_sim: np.ndarray,
    ratings: np.ndarray,
    years: np.ndarray,
) -> np.ndarray:
    """
    Ensemble: combine content, collaborative, and knowledge signals.

    Knowledge signal = year_proximity × rating_quality
      - Movies closer in time are more similar
      - Higher-rated movies get a small boost
    """
    n = len(ratings)

    # Knowledge-based: year proximity (Gaussian kernel, σ=5 years)
    year_diff = np.abs(years[:, None] - years[None, :]).astype(np.float32)
    year_sim = np.exp(-(year_diff ** 2) / (2 * 5.0 ** 2))

    # Rating quality boost: geometric mean of both ratings
    rating_matrix = np.sqrt(np.maximum(ratings[:, None] * ratings[None, :], 0))
    # Normalize to [0, 1]
    rmax = rating_matrix.max()
    if rmax > 0:
        rating_matrix = rating_matrix / rmax

    knowledge_sim = year_sim * 0.7 + rating_matrix * 0.3

    # Weighted ensemble
    hybrid = (
        0.45 * content_sim
        + 0.30 * collab_sim
        + 0.25 * knowledge_sim
    )

    # Zero out diagonal (no self-recommendation)
    np.fill_diagonal(hybrid, 0.0)

    return hybrid.astype(np.float32)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, tfidf_matrix, content_sim_matrix, collab_sim_matrix
    global hybrid_sim_matrix, slugs_to_idx, rec_cache, model_info

    try:
        data_path = os.path.join(os.path.dirname(__file__), "movies.json")
        if not os.path.exists(data_path):
            logger.error(f"{data_path} not found.")
            yield
            return

        with open(data_path, "r", encoding="utf-8") as f:
            raw = json.load(f)

        if not raw:
            logger.error("movies.json is empty.")
            yield
            return

        df = pd.DataFrame(raw)

        # ── Data Normalization ──────────────────────────────────────────────
        df["genre"] = df["genre"].apply(lambda x: x if isinstance(x, list) else [])

        def normalize_cast(items):
            if not isinstance(items, list):
                return []
            return [
                item.get("name", "") if isinstance(item, dict) else str(item)
                for item in items
                if item
            ]

        df["cast"] = df["cast"].apply(normalize_cast)
        df["director"] = df["director"].apply(
            lambda x: str(x).lower().strip() if pd.notna(x) else "unknown"
        )
        df["title"] = df["title"].apply(lambda x: str(x) if pd.notna(x) else "untitled")
        df["synopsis"] = df["synopsis"].apply(
            lambda x: str(x).lower() if pd.notna(x) else ""
        )
        df["year"] = df["year"].apply(lambda x: int(x) if pd.notna(x) else 0)
        df["slug"] = df["slug"].apply(lambda x: str(x) if pd.notna(x) else "")

        # Rating: normalize to 0-10 scale (Sanity stores on 0-10 already)
        df["rating"] = df["rating"].apply(
            lambda x: float(x) if pd.notna(x) and x > 0 else 0.0
        )

        # ── Feature Engineering ─────────────────────────────────────────────
        # Build rich text features for TF-IDF
        df["features"] = (
            df["genre"].apply(lambda x: " ".join(x * 3))  # genres repeated 3x for weight
            + " "
            + df["director"]
            + " "
            + df["director"]  # director repeated for emphasis
            + " "
            + df["cast"].apply(lambda x: " ".join(x))
            + " "
            + df["cast"].apply(lambda x: " ".join(x))  # cast repeated for emphasis
            + " "
            + df["synopsis"].apply(lambda x: " ".join(x.split()[:80]))
        )

        # ── Algorithm 1: Content-Based TF-IDF ──────────────────────────────
        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=8000,
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
        )
        tfidf_matrix = vectorizer.fit_transform(df["features"])

        logger.info("Computing content-based similarity matrix...")
        content_sim_matrix = cosine_similarity(tfidf_matrix).astype(np.float32)
        np.fill_diagonal(content_sim_matrix, 0.0)

        # ── Algorithm 2: Collaborative Network ──────────────────────────────
        logger.info("Building cast/director collaborative network...")
        collab_sim_matrix = _build_cast_director_network(df)

        # ── Algorithm 3: Hybrid Ensemble ────────────────────────────────────
        logger.info("Building hybrid ensemble matrix...")
        ratings_arr = df["rating"].values.astype(np.float32)
        years_arr = df["year"].values.astype(np.float32)
        hybrid_sim_matrix = _build_hybrid_matrix(
            content_sim_matrix, collab_sim_matrix, ratings_arr, years_arr
        )

        # Index mappings
        slugs_to_idx = {slug: idx for idx, slug in enumerate(df["slug"])}
    
        rec_cache = {}

        # Free memory
        del df["features"]
        del vectorizer
        gc.collect()

        # Model metadata
        file_hash = hashlib.md5(
            open(data_path, "rb").read()
        ).hexdigest()[:8]

        model_info = {
            "version": "2.0.0",
            "algorithms": [
                "content-based-tfidf",
                "collaborative-network",
                "knowledge-based",
                "ensemble-hybrid",
            ],
            "movies_loaded": len(df),
            "tfidf_features": tfidf_matrix.shape[1],
            "data_hash": file_hash,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "weights": {
                "content": 0.45,
                "collaborative": 0.30,
                "knowledge": 0.25,
            },
        }

        logger.info(
            f"✅ ML engine loaded: {len(df)} movies, "
            f"{tfidf_matrix.shape[1]} TF-IDF features, "
            f"3 similarity matrices computed"
        )

    except Exception as e:
        logger.error(f"Failed to load movie data: {e}")

    yield

    # Cleanup
    df = None
    tfidf_matrix = None
    content_sim_matrix = None
    collab_sim_matrix = None
    hybrid_sim_matrix = None
    slugs_to_idx = {}
    rec_cache = {}
    model_info = {}
    gc.collect()


app = FastAPI(
    title="KollywoodAI ML Recommendation Engine",
    description="Real ML-powered Tamil movie recommendations using ensemble algorithms",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _get_movie_row(slug: str):
    """Helper to fetch a movie row by slug."""
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if slug not in slugs_to_idx:
        raise HTTPException(status_code=404, detail=f"Movie '{slug}' not found")
    idx = slugs_to_idx[slug]
    return df.iloc[idx], idx


def _build_recommendation(idx: int, scores: np.ndarray, n: int) -> dict:
    """Build recommendation response from a similarity score array."""
    top_indices = np.argsort(scores)[::-1][:n]

    recommendations = []
    for i in top_indices:
        row = df.iloc[i]
        recommendations.append(
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
                "score": round(float(scores[i]), 4),
            }
        )

    return {
        "total_results": len(recommendations),
        "recommendations": recommendations,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════


@app.get("/health")
def health():
    if df is None or hybrid_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "status": "ok",
        "movies_loaded": len(df),
        "model_version": model_info.get("version", "unknown"),
    }


@app.get("/model/info")
def get_model_info():
    if not model_info:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return model_info


@app.get("/recommend/{movie_slug}")
def recommend(
    movie_slug: str,
    n: int = Query(default=6, ge=1, le=30),
):
    """
    Get ML-powered recommendations for a specific movie.
    Uses the hybrid ensemble of content, collaborative, and knowledge signals.
    """
    if hybrid_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    _, idx = _get_movie_row(movie_slug)

    cache_key = f"hybrid_{movie_slug}_{n}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    hybrid_scores = hybrid_sim_matrix[idx].copy()
    result = _build_recommendation(idx, hybrid_scores, n)
    result["movie"] = movie_slug
    result["algorithm"] = "ensemble-hybrid"

    rec_cache[cache_key] = result
    return result


@app.get("/recommend/{movie_slug}/content")
def recommend_content(
    movie_slug: str,
    n: int = Query(default=6, ge=1, le=30),
):
    """Content-based only: similar movies by text features (genre, cast, synopsis)."""
    if content_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    _, idx = _get_movie_row(movie_slug)
    scores = content_sim_matrix[idx].copy()
    result = _build_recommendation(idx, scores, n)
    result["movie"] = movie_slug
    result["algorithm"] = "content-based-tfidf"
    return result


@app.get("/recommend/{movie_slug}/collaborative")
def recommend_collaborative(
    movie_slug: str,
    n: int = Query(default=6, ge=1, le=30),
):
    """Collaborative network: similar movies by shared cast/crew connections."""
    if collab_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    _, idx = _get_movie_row(movie_slug)
    scores = collab_sim_matrix[idx].copy()
    result = _build_recommendation(idx, scores, n)
    result["movie"] = movie_slug
    result["algorithm"] = "collaborative-network"
    return result


@app.get("/recommend/top-picks")
def top_picks(
    n: int = Query(default=12, ge=1, le=30),
    genre: str = Query(default="", description="Optional genre filter"),
    year: int = Query(default=0, description="Filter by year (0 = all years)"),
):
    """
    Curated ML-powered top picks.
    Selects diverse, high-quality movies using score × rating × recency.
    Pass year=2026 to get only 2026 releases.
    """
    if df is None or hybrid_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    cache_key = f"top_{n}_{genre}_{year}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    candidates = df.copy()
    if year > 0:
        candidates = candidates[candidates["year"] == year]
    if genre:
        genre_lower = genre.lower()
        candidates = candidates[
            candidates["genre"].apply(lambda g: genre_lower in [x.lower() for x in g])
        ]

    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "algorithm": "top-picks"}

    # Score = rating_quality × diversity_bonus
    # We want movies that are well-rated but also from different directors/eras
    scores = []
    seen_directors = set()
    seen_decades = set()

    # Sort by rating first, then year (newest first)
    candidates = candidates.sort_values(["rating", "year"], ascending=[False, False])

    for _, row in candidates.iterrows():
        base_score = row["rating"] / 10.0  # Normalize to 0-1
        recency_bonus = (row["year"] - 2000) / 30.0  # Newer movies get a small boost
        recency_bonus = max(0, min(recency_bonus, 0.3))

        # Diversity: penalize same director or same decade
        director = row["director"]
        decade = (row["year"] // 10) * 10
        diversity = 1.0
        if director in seen_directors:
            diversity *= 0.85
        if decade in seen_decades:
            diversity *= 0.95

        final_score = (base_score * 0.7 + recency_bonus * 0.3) * diversity
        scores.append(final_score)

        seen_directors.add(director)
        seen_decades.add(decade)

    candidates = candidates.copy()
    candidates["_ml_score"] = scores
    candidates = candidates.sort_values("_ml_score", ascending=False).head(n)

    recommendations = []
    for _, row in candidates.iterrows():
        recommendations.append(
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
            }
        )

    result = {
        "total_results": len(recommendations),
        "recommendations": recommendations,
        "algorithm": "top-picks",
    }

    rec_cache[cache_key] = result
    return result


@app.get("/recommend/trending")
def trending(
    n: int = Query(default=12, ge=1, le=30),
    year: int = Query(default=0, description="Filter by year (0 = all years)"),
):
    """
    Trending movies: recent + well-rated + popular cast.
    Combines recency, rating, and cast popularity score.
    Pass year=2026 to get only 2026 releases.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    cache_key = f"trending_{n}_{year}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    # Build cast popularity from frequency across all movies
    cast_popularity = defaultdict(int)
    for _, row in df.iterrows():
        cast_list = row.get("cast", [])
        if isinstance(cast_list, list):
            for c in cast_list:
                name = c if isinstance(c, str) else str(c)
                cast_popularity[name.strip().lower()] += 1

    max_pop = max(cast_popularity.values()) if cast_popularity else 1

    current_year = datetime.now(timezone.utc).year
    trending_df = df.copy()
    if year > 0:
        trending_df = trending_df[trending_df["year"] == year]
    scores = []

    for _, row in trending_df.iterrows():
        # Recency: exponential decay from current year
        year_diff = max(current_year - row["year"], 0)
        recency = np.exp(-year_diff / 5.0)  # ~5 year half-life

        # Rating quality
        rating_score = row["rating"] / 10.0

        # Cast popularity: average popularity of top cast
        cast_list = row.get("cast", [])
        cast_score = 0
        if isinstance(cast_list, list) and len(cast_list) > 0:
            pops = []
            for c in cast_list[:5]:  # Top 5 cast
                name = c if isinstance(c, str) else str(c)
                pops.append(cast_popularity.get(name.strip().lower(), 0) / max_pop)
            cast_score = np.mean(pops) if pops else 0

        # Combined trending score
        trending_score = (
            recency * 0.40
            + rating_score * 0.35
            + cast_score * 0.25
        )
        scores.append(trending_score)

    df_temp = trending_df.copy()
    df_temp["_trending_score"] = scores
    df_temp = df_temp.sort_values("_trending_score", ascending=False).head(n)

    recommendations = []
    for _, row in df_temp.iterrows():
        recommendations.append(
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
            }
        )

    result = {
        "total_results": len(recommendations),
        "recommendations": recommendations,
        "algorithm": "trending",
    }

    rec_cache[cache_key] = result
    return result


@app.get("/recommend/genre/{genre}")
def recommend_by_genre(
    genre: str,
    n: int = Query(default=12, ge=1, le=30),
    min_rating: float = Query(default=0.0, ge=0, le=10),
    year: int = Query(default=0, description="Filter by year (0 = all years)"),
):
    """
    Best movies in a genre, ranked by ML quality score.
    Pass year=2026 to get only 2026 releases.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    genre_lower = genre.lower()
    candidates = df[
        df["genre"].apply(lambda g: genre_lower in [x.lower() for x in g])
        & (df["rating"] >= min_rating)
    ].copy()
    if year > 0:
        candidates = candidates[candidates["year"] == year]

    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "genre": genre, "algorithm": "genre"}

    # Quality score: rating + recency + cast diversity
    scores = []
    for _, row in candidates.iterrows():
        rating_score = row["rating"] / 10.0
        recency = (row["year"] - 2000) / 30.0
        recency = max(0, min(recency, 0.3))
        scores.append(rating_score * 0.7 + recency * 0.3)

    candidates = candidates.copy()
    candidates["_genre_score"] = scores
    candidates = candidates.sort_values("_genre_score", ascending=False).head(n)

    recommendations = []
    for _, row in candidates.iterrows():
        recommendations.append(
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
            }
        )

    return {
        "total_results": len(recommendations),
        "recommendations": recommendations,
        "genre": genre,
        "algorithm": "genre",
    }


@app.get("/recommend/personalized")
def personalized(
    favorite_genres: str = Query(
        default="", description="Comma-separated genre preferences, e.g. 'action,romance'"
    ),
    favorite_directors: str = Query(
        default="", description="Comma-separated director names"
    ),
    min_year: int = Query(default=1950, ge=1930, le=2030),
    max_year: int = Query(default=2030, ge=1930, le=2030),
    min_rating: float = Query(default=0.0, ge=0, le=10),
    n: int = Query(default=12, ge=1, le=30),
):
    """
    Personalized recommendations based on user preferences.
    Uses weighted scoring matching user preferences against movie features.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    pref_genres = [g.strip().lower() for g in favorite_genres.split(",") if g.strip()]
    pref_directors = [d.strip().lower() for d in favorite_directors.split(",") if d.strip()]

    candidates = df[
        (df["year"] >= min_year)
        & (df["year"] <= max_year)
        & (df["rating"] >= min_rating)
    ].copy()

    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "algorithm": "personalized"}

    scores = []
    for _, row in candidates.iterrows():
        # Genre match score
        genre_score = 0
        if pref_genres:
            movie_genres = [g.lower() for g in row["genre"]]
            matches = len(set(pref_genres) & set(movie_genres))
            genre_score = matches / len(pref_genres) if pref_genres else 0

        # Director match score
        director_score = 0
        if pref_directors:
            if row["director"] in pref_directors:
                director_score = 1.0

        # Base quality
        quality = row["rating"] / 10.0

        # Year proximity: prefer recent
        year_range = max_year - min_year if max_year > min_year else 1
        recency = (row["year"] - min_year) / year_range

        # Combined
        if pref_genres or pref_directors:
            final = (
                genre_score * 0.35
                + director_score * 0.20
                + quality * 0.30
                + recency * 0.15
            )
        else:
            # No preferences → just rank by quality
            final = quality * 0.7 + recency * 0.3

        scores.append(final)

    candidates = candidates.copy()
    candidates["_personal_score"] = scores
    candidates = candidates.sort_values("_personal_score", ascending=False).head(n)

    recommendations = []
    for _, row in candidates.iterrows():
        recommendations.append(
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
            }
        )

    return {
        "total_results": len(recommendations),
        "recommendations": recommendations,
        "algorithm": "personalized",
        "preferences": {
            "genres": pref_genres,
            "directors": pref_directors,
            "year_range": [min_year, max_year],
            "min_rating": min_rating,
        },
    }


@app.get("/recommend/decade/{decade}")
def recommend_by_decade(
    decade: int,
    n: int = Query(default=12, ge=1, le=30),
):
    """
    Best movies from a specific decade (e.g. 2000, 2010, 2020).
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    cache_key = f"decade_{decade}_{n}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    candidates = df[(df["year"] >= decade) & (df["year"] < decade + 10)].copy()
    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "algorithm": "decade"}

    # Score by rating + diversity (avoid same director)
    candidates = candidates.sort_values(["rating", "year"], ascending=[False, False])
    scores = []
    seen_directors = set()
    for _, row in candidates.iterrows():
        base = row["rating"] / 10.0
        diversity = 1.0 if row["director"] not in seen_directors else 0.85
        scores.append(base * diversity)
        seen_directors.add(row["director"])

    candidates["_score"] = scores
    candidates = candidates.sort_values("_score", ascending=False).head(n)

    recommendations = [
        {
            "title": row["title"],
            "slug": row["slug"],
            "year": int(row["year"]),
            "director": row["director"],
            "genre": row["genre"],
            "rating": round(float(row["rating"]), 1),
        }
        for _, row in candidates.iterrows()
    ]

    result = {"total_results": len(recommendations), "recommendations": recommendations, "algorithm": "decade"}
    rec_cache[cache_key] = result
    return result


@app.get("/recommend/critically-acclaimed")
def critically_acclaimed(
    n: int = Query(default=12, ge=1, le=30),
    genre: str = Query(default=""),
):
    """
    Highest rated movies overall — the must-watch canon.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    cache_key = f"critically_{n}_{genre}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    candidates = df[df["rating"] > 0].copy()
    if genre:
        genre_lower = genre.lower()
        candidates = candidates[
            candidates["genre"].apply(lambda g: genre_lower in [x.lower() for x in g])
        ]

    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "algorithm": "critically-acclaimed"}

    # Score by rating weighted with cast richness
    candidates["_credibility"] = candidates.apply(
        lambda r: r["rating"] / 10.0 * 0.7 + min(len(r.get("cast", [])) / 10.0, 0.3),
        axis=1,
    )
    candidates = candidates.sort_values("_credibility", ascending=False).head(n)

    recommendations = [
        {
            "title": row["title"],
            "slug": row["slug"],
            "year": int(row["year"]),
            "director": row["director"],
            "genre": row["genre"],
            "rating": round(float(row["rating"]), 1),
        }
        for _, row in candidates.iterrows()
    ]

    result = {"total_results": len(recommendations), "recommendations": recommendations, "algorithm": "critically-acclaimed"}
    rec_cache[cache_key] = result
    return result


@app.get("/recommend/hidden-gems")
def hidden_gems(
    n: int = Query(default=12, ge=1, le=30),
):
    """
    Underrated movies with great ratings but fewer known cast — hidden gems.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    cache_key = f"gems_{n}"
    if cache_key in rec_cache:
        return rec_cache[cache_key]

    cast_popularity = defaultdict(int)
    for _, row in df.iterrows():
        for c in row.get("cast", []):
            name = c if isinstance(c, str) else str(c)
            cast_popularity[name.strip().lower()] += 1
    max_pop = max(cast_popularity.values()) if cast_popularity else 1

    candidates = df[(df["rating"] >= 6.0)].copy()
    scores = []
    for _, row in candidates.iterrows():
        cast_list = row.get("cast", [])
        avg_pop = 0
        if isinstance(cast_list, list) and len(cast_list) > 0:
            pops = [cast_popularity.get((c if isinstance(c, str) else str(c)).strip().lower(), 0) / max_pop for c in cast_list[:5]]
            avg_pop = np.mean(pops)
        # High rating + low cast popularity = hidden gem
        gem_score = (row["rating"] / 10.0) * 0.6 + (1.0 - avg_pop) * 0.4
        scores.append(gem_score)

    candidates["_gem_score"] = scores
    candidates = candidates.sort_values("_gem_score", ascending=False).head(n)

    recommendations = [
        {
            "title": row["title"],
            "slug": row["slug"],
            "year": int(row["year"]),
            "director": row["director"],
            "genre": row["genre"],
            "rating": round(float(row["rating"]), 1),
        }
        for _, row in candidates.iterrows()
    ]

    result = {"total_results": len(recommendations), "recommendations": recommendations, "algorithm": "hidden-gems"}
    rec_cache[cache_key] = result
    return result


@app.get("/recommend/director/{director_name}")
def recommend_by_director(
    director_name: str,
    n: int = Query(default=12, ge=1, le=30),
):
    """
    Best movies by a specific director.
    """
    if df is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    dir_lower = director_name.lower().strip()
    candidates = df[df["director"] == dir_lower].sort_values("rating", ascending=False).head(n)

    if candidates.empty:
        return {"total_results": 0, "recommendations": [], "algorithm": "director"}

    recommendations = [
        {
            "title": row["title"],
            "slug": row["slug"],
            "year": int(row["year"]),
            "director": row["director"],
            "genre": row["genre"],
            "rating": round(float(row["rating"]), 1),
        }
        for _, row in candidates.iterrows()
    ]

    return {"total_results": len(recommendations), "recommendations": recommendations, "algorithm": "director"}


@app.get("/movies")
def list_movies(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    if df is None:
        raise HTTPException(status_code=503, detail="Movie data not loaded")

    start = (page - 1) * limit
    end = start + limit
    movie_slice = df.iloc[start:end]

    return {
        "page": page,
        "limit": limit,
        "total_movies": len(df),
        "movies": [
            {
                "title": row["title"],
                "slug": row["slug"],
                "year": int(row["year"]),
                "director": row["director"],
                "genre": row["genre"],
                "rating": round(float(row["rating"]), 1),
            }
            for _, row in movie_slice.iterrows()
        ],
    }


@app.post("/reload")
def reload_data():
    global rec_cache
    rec_cache = {}
    return {"message": "Cache cleared", "cached_entries": 0}
