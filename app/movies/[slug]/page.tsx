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
import { Calendar, User, Tv, Star, ChevronLeft, Info, MessageSquare, Film } from 'lucide-react'

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
    const timeout = setTimeout(() => controller.abort(), 5000)
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
      <h2 className="font-display text-2xl font-extrabold mt-8 mb-4 text-white/90">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold mt-6 mb-3 text-white/90">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="leading-relaxed mb-4 text-base text-white/50">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-crimson bg-crimson/5 pl-5 pr-4 py-4 my-6 italic rounded-r-xl text-white/60">
        {children}
      </blockquote>
    ),
  },
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

  return (
    <div className="bg-ink min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Header */}
      <div className="relative pt-32 pb-12 border-b border-white/5 overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0 opacity-20 blur-3xl" style={{ 
          background: `radial-gradient(circle at 20% 30%, var(--crimson) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--violet) 0%, transparent 50%)`
        }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/movies" className="inline-flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white/70 transition-colors mb-8 group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Poster Card */}
            <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 relative group">
                {posterUrl ? (
                  <Image 
                    src={posterUrl} 
                    alt={movie.title} 
                    width={256} 
                    height={384} 
                    sizes="(max-width: 768px) 192px, 256px"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white/[0.04]">
                    <Film size={48} className="text-white/20 mb-4" />
                    <p className="font-bold text-lg text-white/90">{movie.title}</p>
                    <p className="text-sm mt-2 text-white/30">{movie.year}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Info Col */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {movie.genre?.map(g => (
                  <span key={g} className="px-3 py-1 rounded-full bg-crimson/10 border border-crimson/20 text-[10px] font-bold uppercase tracking-widest text-crimson">
                    {g}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[0.9] mb-4">
                {movie.title}
              </h1>
              
              {movie.titleTanglish && movie.titleTanglish !== movie.title && (
                <p className="text-xl md:text-2xl font-serif italic text-crimson mb-6">&quot;{movie.titleTanglish}&quot;</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < fullStars ? "#F0B429" : "none"} 
                        className={i < fullStars ? "text-accent" : "text-white/10"} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-display font-extrabold text-2xl text-accent leading-none">{rating.toFixed(1)}</span>
                  <span className="text-sm text-white/20 font-bold">/ 5.0</span>
                </div>
                
                <div className="h-8 w-px bg-white/10 hidden md:block" />
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Year</span>
                    <span className="text-sm font-bold text-white/80">{movie.year}</span>
                  </div>
                  {movie.ottPlatform && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Streaming</span>
                      <span className="text-sm font-bold text-white/80">{movie.ottPlatform}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Synopsis */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Info size={16} className="text-crimson" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">The Story</h2>
              </div>
              <p className="text-lg md:text-xl leading-relaxed text-white/60 font-medium max-w-3xl">
                {movie.synopsis || 'Plot details are currently being updated by our editors.'}
              </p>
            </section>

            {/* Cast Grid */}
            {movie.cast && movie.cast.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-violet" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Cast & Crew</h2>
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest">
                    {movie.cast.length} Members
                  </span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
                  {movie.cast.map((actor, idx) => {
                    const name = getCastName(actor)
                    const character = getCastCharacter(actor)
                    const photo = getCastPhoto(actor)
                    const initial = getCastInitial(actor)
                    return (
                      <div key={idx} className="group">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 mb-3 shadow-lg group-hover:border-violet/30 transition-colors">
                          {photo ? (
                            <Image src={photo} alt={name} width={200} height={200} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <CastPhoto photo={null} name={name} initial={initial} />
                          )}
                        </div>
                        <p className="text-[11px] font-extrabold text-white/90 leading-tight truncate">{name}</p>
                        {character && (
                          <p className="text-[9px] text-white/30 font-bold truncate mt-0.5 italic">as {character}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Review Section */}
            {movie.review && (
              <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
                <div className="flex items-center gap-2 mb-8">
                  <MessageSquare size={16} className="text-accent" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Critical Analysis</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <PortableText value={movie.review} components={ptComponents} />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 sticky top-32">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-6 pb-4 border-b border-white/5">Technical Specs</h3>
              <div className="space-y-6">
                <SpecItem icon={<Calendar size={14} />} label="Release Year" value={String(movie.year)} />
                <SpecItem icon={<User size={14} />} label="Director" value={movie.director || 'N/A'} />
                <SpecItem icon={<Tv size={14} />} label="Platform" value={movie.ottPlatform || 'Theatrical'} />
                <SpecItem icon={<Info size={14} />} label="Movie ID" value={movie._id.slice(-8).toUpperCase()} />
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-2">
                {movie.genre?.map(g => (
                  <span key={g} className="text-[9px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40 uppercase tracking-widest hover:text-white/70 transition-colors cursor-default">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <Suspense fallback={<RecommendationSkeleton />}>
        <MovieRecommendations slug={slug} />
      </Suspense>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-white/20 pt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white/80 leading-tight">{value}</p>
      </div>
    </div>
  )
}

function RecommendationSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
      <div className="h-6 w-48 bg-white/5 rounded-full mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </section>
  )
}

async function MovieRecommendations({ slug }: { slug: string }) {
  const recommendations = await getRecommendations(slug)
  if (!recommendations.length) return null
  
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
      <div className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-crimson mb-2">Discovery</h2>
        <h3 className="text-2xl font-display font-extrabold text-white">Similar Movies</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {recommendations.map((rec, i) => (
          <MovieCardErrorBoundary key={rec._id} title={rec.title}>
            <MovieCard movie={rec} index={i} />
          </MovieCardErrorBoundary>
        ))}
      </div>
    </section>
  )
}
