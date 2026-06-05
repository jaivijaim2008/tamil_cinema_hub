import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { PortableText } from '@portabletext/react'
import { client } from '../../../sanity/client'
import { movieBySlugQuery } from '../../../lib/queries'
import { urlFor } from '../../../sanity/lib/image'
import MovieCard, { Movie } from '../../../components/MovieCard'
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
      description: movie.synopsis || '',
      type: 'video.movie',
      images: posterUrl ? [{ url: posterUrl, width: 500, height: 750 }] : [],
    },
  }
}

// ── Portable Text components ──────────────────────────────────────────────
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-white mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-white mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-white/60 leading-relaxed mb-4 text-[15px]">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-violet-500 bg-violet-500/10 px-5 py-3 my-6 italic text-violet-200 rounded-r-xl font-medium">
        {children}
      </blockquote>
    ),
  },
}

// ── Small stat pill ───────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white/60"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
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

  const backdropUrl = movie.backdropUrl || null
  const rating = movie.rating || 0
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    dateCreated: movie.year,
    director: { '@type': 'Person', name: movie.director || 'Unknown' },
    description: movie.synopsis || '',
    image: posterUrl || '',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: '5',
      ratingCount: '1',
    },
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#07070f' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── BACKDROP HERO ───────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(340px, 65vh, 620px)' }}>
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.45) saturate(1.1)' }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0d0d2b 50%, #000 100%)' }}
          />
        )}

        {/* Gradient vignettes */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #07070f 0%, #07070f 5%, rgba(7,7,15,0.55) 45%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(7,7,15,0.75) 0%, transparent 50%)' }} />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px',
          }}
        />

        {/* Back button */}
        <Link
          href="/movies"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:text-white transition-all"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Movies
        </Link>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ marginTop: 'clamp(-180px, -20vw, -240px)' }}>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">

          {/* ── POSTER COLUMN ─────────────────────────────────────────── */}
          <div className="w-full md:w-52 lg:w-60 flex-shrink-0">
            <div className="sticky top-24">

              {/* Poster */}
              <div
                className="rounded-2xl overflow-hidden aspect-[2/3]"
                style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {posterUrl ? (
                  <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                    style={{ background: 'linear-gradient(135deg, #2d1b69, #0d0d2b)' }}
                  >
                    <span className="text-5xl mb-3">🎬</span>
                    <p className="text-white font-bold text-sm leading-tight">{movie.title}</p>
                    <p className="text-violet-400 text-xs mt-1">{movie.year}</p>
                  </div>
                )}
              </div>

              {/* Quick info */}
              <div
                className="mt-4 rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { icon: '📅', label: 'Year',      value: String(movie.year) },
                  { icon: '🎬', label: 'Director',  value: movie.director || '—' },
                  { icon: '📺', label: 'Streaming', value: movie.ottPlatform || '—' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-xs pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-white/35 font-medium whitespace-nowrap">{icon} {label}</span>
                    <span className="text-white/80 font-semibold text-right leading-snug">{value}</span>
                  </div>
                ))}
              </div>

              {/* Genre tags */}
              {movie.genre && movie.genre.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {movie.genre.map((g, i) => (
                    <span
                      key={i}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── DETAILS COLUMN ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pt-2 md:pt-48">

            {/* Title */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {movie.title}
            </h1>
            {movie.titleTanglish && movie.titleTanglish !== movie.title && (
              <p className="mt-2 text-violet-400 text-base font-medium italic">"{movie.titleTanglish}"</p>
            )}

            {/* Rating + meta pills */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled = i < fullStars
                  const half   = !filled && i === fullStars && hasHalf
                  return (
                    <svg
                      key={i}
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill={filled ? '#fbbf24' : 'none'}
                      stroke={filled || half ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
                      strokeWidth="1.5"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )
                })}
                <span className="ml-2 text-white font-black text-lg">{rating.toFixed(1)}</span>
                <span className="text-white/30 text-sm ml-0.5">/5</span>
              </div>

              <Pill>{movie.year}</Pill>
              {movie.ottPlatform && <Pill>📺 {movie.ottPlatform}</Pill>}
            </div>

            {/* Divider */}
            <div className="mt-8 h-px" style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.4), transparent)' }} />

            {/* Synopsis */}
            <section className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-3">Synopsis</p>
              <p className="text-white/55 text-[15px] leading-loose max-w-2xl">
                {movie.synopsis || 'Synopsis not available yet.'}
              </p>
            </section>

            {/* Divider */}
            <div className="mt-8 h-px" style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.4), transparent)' }} />

            {/* Director */}
            {movie.director && (
              <section className="mt-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-4">Director</p>
                <div
                  className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}
                  >
                    {movie.director.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{movie.director}</p>
                    <p className="text-white/30 text-xs">Director</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── CAST ─────────────────────────────────────────────────── */}
            {movie.cast && movie.cast.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-1">Cast</p>
                    <h3
                      className="text-white font-black text-lg"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Meet the Actors
                    </h3>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    {movie.cast.length} members
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {movie.cast.map((actor, idx) => {
                    const name      = getCastName(actor)
                    const character = getCastCharacter(actor)
                    const photo     = getCastPhoto(actor)
                    const initial   = getCastInitial(actor)

                    // Unique hue per actor for gradient fallback
                    const hue = (idx * 47) % 360

                    return (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl transition-all duration-300 cursor-default"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {/* Square photo area */}
                        <div className="relative aspect-square overflow-hidden">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg,
                                  hsl(${hue}, 40%, 18%) 0%,
                                  hsl(${(hue + 40) % 360}, 30%, 10%) 100%)`,
                              }}
                            >
                              <span
                                className="text-4xl font-black select-none"
                                style={{
                                  color: `hsl(${hue}, 60%, 70%)`,
                                  fontFamily: "'Outfit', sans-serif",
                                }}
                              >
                                {initial}
                              </span>
                            </div>
                          )}

                          {/* Purple hover overlay */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(to top, rgba(109,40,217,0.6) 0%, transparent 55%)',
                            }}
                          />

                          {/* Index badge — appears on hover */}
                          <div
                            className="absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all duration-200"
                            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#a78bfa' }}
                          >
                            {idx + 1}
                          </div>
                        </div>

                        {/* Name + character row */}
                        <div
                          className="px-2.5 py-2.5"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <p className="text-white text-[11px] font-black leading-tight line-clamp-1 group-hover:text-violet-300 transition-colors duration-200">
                            {name}
                          </p>
                          {character ? (
                            <p className="text-white/35 text-[10px] mt-0.5 line-clamp-1 italic">
                              as {character}
                            </p>
                          ) : (
                            <p className="text-white/20 text-[10px] mt-0.5">Actor</p>
                          )}
                        </div>

                        {/* Bottom violet accent bar — slides in on hover */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                          style={{ background: 'linear-gradient(to right, #7c3aed, #a78bfa)' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Review */}
            {movie.review && (
              <>
                <div className="mt-12 h-px" style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.4), transparent)' }} />
                <section className="mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-5">Full Review</p>
                  <div
                    className="rounded-2xl p-6 sm:p-8"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <PortableText value={movie.review} components={ptComponents} />
                  </div>
                </section>
              </>
            )}

            <div className="pb-20" />
          </div>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <MovieRecommendations slug={slug} />
      </Suspense>
    </div>
  )
}

// ── Non-blocking recommendations ─────────────────────────────────────────
async function MovieRecommendations({ slug }: { slug: string }) {
  const recommendations = await getRecommendations(slug)
  if (!recommendations.length) return null
  return (
    <section
      className="mt-4 pt-16 pb-20"
      style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-1">You Might Like</p>
          <h2
            className="text-2xl font-black text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Similar Movies
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendations.map((rec) => (
            <MovieCard key={rec._id} movie={rec} />
          ))}
        </div>
      </div>
    </section>
  )
}