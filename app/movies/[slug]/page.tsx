import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { PortableText } from '@portabletext/react'
import { client } from '../../../sanity/client'
import { movieBySlugQuery } from '../../../lib/queries'
import { urlFor } from '../../../sanity/lib/image'
import MovieCard, { Movie } from '../../../components/MovieCard'
import MovieCardErrorBoundary from '../../../components/MovieCardErrorBoundary'
import CastPhoto from '../../../components/CastPhoto'

interface MovieDetailProps {
  params: Promise<{ slug: string }>
}

type CastMember = string | {
  name: string
  character?: string
  photo?: any
  tmdbPersonId?: number
}

type FullMovie = Movie & {
  review?: any
  posterUrl?: string
  backdropUrl?: string
  cast?: CastMember[]
}

function getCastName(actor: CastMember): string {
  return typeof actor === 'string' ? actor : actor.name || ''
}
function getCastCharacter(actor: CastMember): string {
  return typeof actor === 'string' ? '' : actor.character || ''
}
function getCastInitial(actor: CastMember): string {
  return getCastName(actor).charAt(0).toUpperCase()
}
function getCastPhoto(actor: CastMember): string | null {
  if (typeof actor === 'string' || !actor.photo) return null
  try { return urlFor(actor.photo).width(300).height(300).quality(90).fit('max').url() } catch { return null }
}

async function getMovieData(slug: string): Promise<FullMovie | null> {
  try {
    const movie = await client.fetch<FullMovie>(movieBySlugQuery, { slug })
    return movie || null
  } catch { return null }
}

async function getRecommendations(slug: string): Promise<Movie[]> {
  const base = process.env.RECOMMENDER_API_URL
  if (!base) return []
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${base}/recommend/${slug}?n=6`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    const recSlugs = data.recommendations?.map((r: any) => r.slug) || []
    if (!recSlugs.length) return []
    return await client.fetch<Movie[]>(
      `*[_type == "movie" && slug.current in $recSlugs] {
        _id, title, titleTanglish, "slug": slug.current,
        year, director, cast, genre, rating,
        poster, posterUrl, backdropUrl, synopsis, ottPlatform, tmdbId
      }`,
      { recSlugs }
    )
  } catch { return [] }
}

export async function generateMetadata({ params }: MovieDetailProps): Promise<Metadata> {
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) return { title: 'Movie Not Found | TamilCinemaHub' }
  const posterUrl = movie.poster
    ? urlFor(movie.poster).width(600).height(900).quality(90).fit('max').url()
    : movie.posterUrl || null
  return {
    title: `${movie.title} (${movie.year}) | TamilCinemaHub`,
    description: movie.synopsis || `Full details, cast, rating and review for ${movie.title} (${movie.year}).`,
    openGraph: {
      title: `${movie.title} (${movie.year})`,
      description: movie.synopsis || `Full details, cast, rating and review for ${movie.title} (${movie.year}).`,
      type: 'video.movie',
      url: `https://tamilcinemahub.xyz/movies/${slug}`,
      images: posterUrl ? [{ url: posterUrl, width: 500, height: 750, alt: `${movie.title} movie poster` }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${movie.title} (${movie.year})`,
      description: movie.synopsis || `Full details, cast, rating and review for ${movie.title} (${movie.year}).`,
      images: posterUrl ? [posterUrl] : [],
    },
    alternates: { canonical: `https://tamilcinemahub.xyz/movies/${slug}` },
  }
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, marginTop: 32, marginBottom: 12, color: 'rgba(255,255,255,0.92)' }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 24, marginBottom: 8, color: 'rgba(255,255,255,0.92)' }}>{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p style={{ lineHeight: 1.8, marginBottom: 16, fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{ borderLeft: '3px solid var(--crimson)', background: 'rgba(212,41,26,0.08)', paddingLeft: 20, paddingRight: 16, paddingTop: 12, paddingBottom: 12, margin: '24px 0', fontStyle: 'italic', borderRadius: '0 8px 8px 0', color: 'rgba(255,255,255,0.5)' }}>
        {children}
      </blockquote>
    ),
  },
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 6, paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </span>
  )
}

export default async function MovieDetailPage({ params }: MovieDetailProps) {
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) notFound()

  const posterUrl = movie.poster
    ? urlFor(movie.poster).width(600).height(900).quality(90).fit('max').url()
    : movie.posterUrl || null

  const rating = movie.rating || 0
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.25

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title,
      dateCreated: movie.year,
      director: { '@type': 'Person', name: movie.director || 'Unknown' },
      description: movie.synopsis || '',
      image: posterUrl || '',
      url: `https://tamilcinemahub.xyz/movies/${slug}`,
      genre: movie.genre || [],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, bestRating: '5', ratingCount: '1' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tamilcinemahub.xyz' },
        { '@type': 'ListItem', position: 2, name: 'Movies', item: 'https://tamilcinemahub.xyz/movies' },
        { '@type': 'ListItem', position: 3, name: movie.title },
      ],
    },
  ]

  const t = (v: string) => v // helper

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Page Header */}
      <div className="movie-detail-page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
          <Link href="/movies" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s', textDecoration: 'none' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Movies
          </Link>

          <div className="movie-header-row">
            {/* Poster */}
            <div className="movie-poster-wrap">
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '2/3', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {posterUrl ? (
                  <Image src={posterUrl} alt={movie.title} width={208} height={312} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 40, marginBottom: 12 }}>🎬</span>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>{movie.title}</p>
                    <p style={{ fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.35)' }}>{movie.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title & meta */}
            <div className="movie-info-col">
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: 'rgba(255,255,255,0.92)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {movie.title}
              </h1>
              {movie.titleTanglish && movie.titleTanglish !== movie.title && (
                <p style={{ marginTop: 8, fontSize: 16, fontWeight: 500, fontStyle: 'italic', color: 'var(--crimson)' }}>&quot;{movie.titleTanglish}&quot;</p>
              )}

              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const filled = i < fullStars
                    const half = !filled && i === fullStars && hasHalf
                    return (
                      <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill={filled ? '#C8973A' : 'none'} stroke={filled || half ? '#C8973A' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  })}
                  <span style={{ marginLeft: 8, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#C8973A' }}>{rating.toFixed(1)}</span>
                  <span style={{ fontSize: 14, marginLeft: 2, color: 'rgba(255,255,255,0.35)' }}>/5</span>
                </div>
                <Pill>{movie.year}</Pill>
                {movie.ottPlatform && <Pill>📺 {movie.ottPlatform}</Pill>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="movie-detail-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>

        {/* Left Column */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Synopsis */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Synopsis</p>
            <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 640, color: 'rgba(255,255,255,0.5)' }}>
              {movie.synopsis || 'Synopsis not available yet.'}
            </p>
          </section>

          {/* Director */}
          {movie.director && (
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Director</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, borderRadius: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 18, background: 'var(--crimson)', flexShrink: 0 }}>
                  {movie.director.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>{movie.director}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Director</p>
                </div>
              </div>
            </section>
          )}

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Cast</p>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: 'rgba(255,255,255,0.92)' }}>Meet the Actors</h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, borderRadius: 6, background: 'rgba(212,41,26,0.08)', color: 'var(--crimson)', border: '1px solid rgba(212,41,26,0.15)' }}>
                  {movie.cast.length} members
                </span>
              </div>

              <div className="cast-grid">
                {movie.cast.map((actor, idx) => {
                  const name = getCastName(actor)
                  const character = getCastCharacter(actor)
                  const photo = getCastPhoto(actor)
                  const initial = getCastInitial(actor)
                  return (
                    <div key={idx} style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s' }}>
                      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                        {photo ? (
                          <Image src={photo} alt={name} width={300} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.5s' }} />
                        ) : (
                          <CastPhoto photo={null} name={name} initial={initial} />
                        )}
                      </div>
                      <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: 11, fontWeight: 900, lineHeight: 1.2, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        {character ? (
                          <p style={{ fontSize: 10, marginTop: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>as {character}</p>
                        ) : (
                          <p style={{ fontSize: 10, marginTop: 2, color: 'rgba(255,255,255,0.2)' }}>Actor</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Review */}
          {movie.review && (
            <section>
              <div style={{ height: 1, width: '100%', marginBottom: 32, background: 'rgba(255,255,255,0.06)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 20, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>Full Review</p>
              <div style={{ borderRadius: 16, padding: '24px 32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <PortableText value={movie.review} components={ptComponents} />
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="movie-detail-sidebar" style={{ position: 'sticky', top: 96, height: 'fit-content' }}>
          <div style={{ borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: '📅', label: 'Year', value: String(movie.year) },
              { icon: '🎬', label: 'Director', value: movie.director || '—' },
              { icon: '📺', label: 'Streaming', value: movie.ottPlatform || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, fontSize: 13, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.35)' }}>{icon} {label}</span>
                <span style={{ fontWeight: 700, textAlign: 'right', lineHeight: 1.3, color: 'rgba(255,255,255,0.92)' }}>{value}</span>
              </div>
            ))}
          </div>

          {movie.genre && movie.genre.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {movie.genre.map((g, i) => (
                <span key={i} style={{ borderRadius: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(212,41,26,0.1)', color: 'var(--crimson)', border: '1px solid rgba(212,41,26,0.15)' }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <Suspense fallback={null}>
        <MovieRecommendations slug={slug} />
      </Suspense>
    </div>
  )
}

async function MovieRecommendations({ slug }: { slug: string }) {
  const recommendations = await getRecommendations(slug)
  if (!recommendations.length) return null
  return (
    <section style={{ padding: '64px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4, color: 'var(--rose-light)', fontFamily: "'Syne', sans-serif" }}>You Might Like</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>Similar Movies</h2>
        </div>
        <div className="movies-grid-pill reveal-group">
          {recommendations.map((rec, i) => (
            <MovieCardErrorBoundary key={rec._id} title={rec.title}>
              <MovieCard movie={rec} index={i} />
            </MovieCardErrorBoundary>
          ))}
        </div>
      </div>
    </section>
  )
}
