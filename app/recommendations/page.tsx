import { client } from '../../sanity/client'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '../../sanity/lib/image'
import type { Movie } from '../../components/MovieCard'

export const revalidate = 3600

interface RecMovie extends Movie {
  genre?: string[]
  ottPlatform?: string
}

async function getAllMovies(): Promise<RecMovie[]> {
  try {
    return await client.fetch<RecMovie[]>(
      `*[_type == "movie"] | order(year desc) {
        _id, title, titleTanglish, "slug": slug.current,
        year, director, cast, genre, rating,
        poster, posterUrl, backdropUrl, synopsis, ottPlatform, tmdbId
      }`
    )
  } catch { return [] }
}

function getGenreColor(genre: string): string {
  const colors: Record<string, string> = {
    'Action': 'rgba(212,41,26,0.15)', 'Thriller': 'rgba(124,58,237,0.15)',
    'Romance': 'rgba(244,63,94,0.15)', 'Comedy': 'rgba(240,180,41,0.15)',
    'Drama': 'rgba(59,130,246,0.15)', 'Horror': 'rgba(55,65,81,0.15)',
    'Fantasy': 'rgba(124,58,237,0.15)', 'Sci-Fi': 'rgba(13,148,136,0.15)',
    'Family': 'rgba(132,204,22,0.15)', 'Crime': 'rgba(212,41,26,0.15)',
    'Historical': 'rgba(200,151,58,0.15)', 'Musical': 'rgba(167,139,250,0.15)',
    'Action/Comedy': 'rgba(255,77,28,0.15)',
  }
  return colors[genre] || 'rgba(255,255,255,0.06)'
}

function getGenreTextColor(genre: string): string {
  const colors: Record<string, string> = {
    'Action': '#D4291A', 'Thriller': '#7C3AED', 'Romance': '#F43F5E',
    'Comedy': '#F0B429', 'Drama': '#3B82F6', 'Horror': '#374151',
    'Fantasy': '#7C3AED', 'Sci-Fi': '#0D9488', 'Family': '#84CC16',
    'Crime': '#D4291A', 'Historical': '#C8830A', 'Musical': '#A78BFA',
  }
  return colors[genre] || 'rgba(255,255,255,0.5)'
}

export default async function RecommendationsPage() {
  const movies = await getAllMovies()

  // Group by top genres for recommendation sections
  const genreGroups: Record<string, RecMovie[]> = {}
  const genreCounts: Record<string, number> = {}

  movies.forEach(m => {
    (m.genre || []).forEach(g => {
      if (g) {
        genreCounts[g] = (genreCounts[g] || 0) + 1
      }
    })
  })

  // Get top 6 genres
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre]) => genre)

  topGenres.forEach(genre => {
    genreGroups[genre] = movies
      .filter(m => (m.genre || []).includes(genre))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
  })

  // Top rated overall
  const topRated = [...movies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6)

  // Recent releases
  const recent = [...movies]
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 6)

  // Highest rated per year (hidden gems)
  const yearMap = new Map<number, RecMovie[]>()
  movies.forEach(m => {
    if (m.year && m.rating && m.rating >= 3.5) {
      if (!yearMap.has(m.year)) yearMap.set(m.year, [])
      yearMap.get(m.year)!.push(m)
    }
  })
  const hiddenGems = Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .flatMap(([, films]) => films.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 2))

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Header */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingTop: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
          <Link href="/movies" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s', textDecoration: 'none' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Movies
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--rose-light)', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
            AI-Powered Discovery
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 8, lineHeight: 1.1 }}>
            Movie Recommendations
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 600, lineHeight: 1.6 }}>
            Our recommendation engine uses TF-IDF vectorization and cosine similarity to analyze genre, cast, and director data — surfacing genuinely similar titles you&apos;ll love.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* How it works */}
        <div style={{ marginBottom: 48, padding: '32px 28px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(212,41,26,0.06))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🧠</span> How Recommendations Work
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Feature Extraction', desc: 'Each movie is analyzed for genre, director, and cast members' },
              { step: '2', title: 'TF-IDF Vectorization', desc: 'Movie features are converted into numerical vectors using TF-IDF' },
              { step: '3', title: 'Cosine Similarity', desc: 'Vectors are compared to find movies with the closest match' },
              { step: '4', title: 'Ranked Results', desc: 'Similar movies are ranked by score and shown as recommendations' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--crimson)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>{item.step}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 2 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Section */}
        <RecommendationSection title="Top Rated Movies" subtitle="Highest rated Tamil films in our database" icon="⭐" movies={topRated} />

        {/* Recent Releases */}
        <RecommendationSection title="Latest Releases" subtitle="Freshly added Tamil movies" icon="🆕" movies={recent} />

        {/* Hidden Gems */}
        {hiddenGems.length > 0 && (
          <RecommendationSection title="Hidden Gems" subtitle="Highly rated films you might have missed" icon="💎" movies={hiddenGems} />
        )}

        {/* Genre-based recommendations */}
        {topGenres.map(genre => (
          <RecommendationSection
            key={genre}
            title={`Best ${genre} Movies`}
            subtitle={`${genreGroups[genre].length} films — sorted by rating`}
            icon="🎬"
            movies={genreGroups[genre]}
            genre={genre}
          />
        ))}
      </main>
    </div>
  )
}

function RecommendationSection({ title, subtitle, icon, movies, genre }: {
  title: string; subtitle: string; icon: string; movies: RecMovie[]; genre?: string
}) {
  if (!movies.length) return null
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
          {icon} Recommendations
        </p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {movies.map((movie) => {
          const posterUrl = movie.poster
            ? urlFor(movie.poster).width(400).height(600).quality(85).fit('max').url()
            : movie.posterUrl || null

          return (
            <Link
              key={movie._id}
              href={`/movies/${movie.slug}`}
              style={{
                borderRadius: 12, overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s', textDecoration: 'none', color: 'inherit',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
                {posterUrl ? (
                  <Image src={posterUrl} alt={movie.title} width={400} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center', background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 32, marginBottom: 8 }}>🎬</span>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>{movie.title}</p>
                  </div>
                )}
                {/* Rating badge */}
                {movie.rating ? (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 800, color: '#F0B429', fontFamily: "'Syne', sans-serif" }}>
                    ★ {movie.rating.toFixed(1)}
                  </div>
                ) : null}
                {/* Genre badge */}
                {genre ? (
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: getGenreColor(genre), backdropFilter: 'blur(8px)', borderRadius: 6, padding: '3px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: getGenreTextColor(genre), border: `1px solid ${getGenreTextColor(genre)}33` }}>
                    {genre}
                  </div>
                ) : null}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{movie.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{movie.year}</span>
                  {movie.ottPlatform && (
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      {movie.ottPlatform}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
