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
    alternates: {
      canonical: `https://tamilcinemahub.xyz/movies/${slug}`,
    },
  }
}

// ── Portable Text components ──────────────────────────────────────────────
const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mt-8 mb-3" style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold mt-6 mb-2" style={{ color: '#111111' }}>{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="leading-relaxed mb-4 text-[15px]" style={{ color: '#444444' }}>{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#D4291A] bg-[#FFF5F5] px-5 py-3 my-6 italic rounded-r-lg font-medium" style={{ color: '#D4291A' }}>
        {children}
      </blockquote>
    ),
  },
}

// ── Stat pill ─────────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold"
      style={{ background: '#F2F1EE', color: '#666666', border: '1px solid #E8E7E3' }}
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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        bestRating: '5',
        ratingCount: '1',
      },
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

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F5' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── PAGE HEADER ───────────────────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E7E3' }}>
        <div className="mx-auto max-w-[1280px] px-6 py-10">
          {/* Back button */}
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:text-[#D4291A]"
            style={{ color: '#888888' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-full md:w-52 lg:w-60 flex-shrink-0">
              <div
                className="rounded-xl overflow-hidden aspect-[2/3]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E8E7E3' }}
              >
                {posterUrl ? (
                  <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                    style={{ background: '#F2F1EE' }}
                  >
                    <span className="text-5xl mb-3">🎬</span>
                    <p className="font-bold text-sm leading-tight" style={{ color: '#111111' }}>{movie.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#888888' }}>{movie.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title & meta */}
            <div className="flex-1 min-w-0 pt-2 md:pt-12">
              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
              >
                {movie.title}
              </h1>
              {movie.titleTanglish && movie.titleTanglish !== movie.title && (
                <p className="mt-2 text-base font-medium italic" style={{ color: '#D4291A' }}>&quot;{movie.titleTanglish}&quot;</p>
              )}

              {/* Rating + meta pills */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const filled = i < fullStars
                    const half = !filled && i === fullStars && hasHalf
                    return (
                      <svg
                        key={i}
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill={filled ? '#C8973A' : 'none'}
                        stroke={filled || half ? '#C8973A' : '#E8E7E3'}
                        strokeWidth="1.5"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  })}
                  <span className="ml-2 font-black text-lg" style={{ color: '#C8973A' }}>{rating.toFixed(1)}</span>
                  <span className="text-sm ml-0.5" style={{ color: '#888888' }}>/5</span>
                </div>
                <Pill>{movie.year}</Pill>
                {movie.ottPlatform && <Pill>📺 {movie.ottPlatform}</Pill>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 grid lg:grid-cols-[1fr_340px] gap-10">

        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="min-w-0 space-y-10">

          {/* Synopsis */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#D4291A' }}>Synopsis</p>
            <p className="text-[15px] leading-loose max-w-2xl" style={{ color: '#444444' }}>
              {movie.synopsis || 'Synopsis not available yet.'}
            </p>
          </section>

          {/* Director */}
          {movie.director && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#D4291A' }}>Director</p>
              <div
                className="inline-flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0"
                  style={{ background: '#D4291A' }}
                >
                  {movie.director.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#111111' }}>{movie.director}</p>
                  <p className="text-xs" style={{ color: '#888888' }}>Director</p>
                </div>
              </div>
            </section>
          )}

          {/* ── CAST ─────────────────────────────────────────────────── */}
          {movie.cast && movie.cast.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#D4291A' }}>Cast</p>
                  <h3
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
                  >
                    Meet the Actors
                  </h3>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-md"
                  style={{ background: '#FFF5F5', color: '#D4291A', border: '1px solid #D4291A33' }}
                >
                  {movie.cast.length} members
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {movie.cast.map((actor, idx) => {
                  const name = getCastName(actor)
                  const character = getCastCharacter(actor)
                  const photo = getCastPhoto(actor)
                  const initial = getCastInitial(actor)

                  return (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8E7E3',
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {photo ? (
                          <img
                            src={photo}
                            alt={name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <CastPhoto photo={null} name={name} initial={initial} />
                        )}

                        <div
                          className="absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all duration-200"
                          style={{ background: 'rgba(0,0,0,0.65)', color: '#FFFFFF' }}
                        >
                          {idx + 1}
                        </div>
                      </div>

                      <div
                        className="px-2.5 py-2.5"
                        style={{ borderTop: '1px solid #E8E7E3' }}
                      >
                        <p className="text-[11px] font-black leading-tight line-clamp-1" style={{ color: '#111111' }}>
                          {name}
                        </p>
                        {character ? (
                          <p className="text-[10px] mt-0.5 line-clamp-1 italic" style={{ color: '#888888' }}>
                            as {character}
                          </p>
                        ) : (
                          <p className="text-[10px] mt-0.5" style={{ color: '#AAAAAA' }}>Actor</p>
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
              <div className="h-px w-full mb-8" style={{ background: '#E8E7E3' }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: '#D4291A' }}>Full Review</p>
              <div
                className="rounded-xl p-6 sm:p-8"
                style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
              >
                <PortableText value={movie.review} components={ptComponents} />
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ──────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: '#FFFFFF', border: '1px solid #E8E7E3' }}
          >
            {[
              { icon: '📅', label: 'Year', value: String(movie.year) },
              { icon: '🎬', label: 'Director', value: movie.director || '—' },
              { icon: '📺', label: 'Streaming', value: movie.ottPlatform || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2 text-xs pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: '#E8E7E3' }}>
                <span className="font-medium whitespace-nowrap" style={{ color: '#888888' }}>{icon} {label}</span>
                <span className="font-semibold text-right leading-snug" style={{ color: '#111111' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Genre tags */}
          {movie.genre && movie.genre.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {movie.genre.map((g, i) => (
                <span
                  key={i}
                  className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: '#FFF5F5', color: '#D4291A', border: '1px solid #D4291A33' }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
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
      className="py-16"
      style={{ background: '#FFFFFF', borderTop: '1px solid #E8E7E3' }}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#D4291A' }}>You Might Like</p>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "'Fraunces', serif", color: '#111111' }}
          >
            Similar Movies
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {recommendations.map((rec) => (
            <MovieCard key={rec._id} movie={rec} />
          ))}
        </div>
      </div>
    </section>
  )
}
