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
import { Calendar, User, Tv, Star, ChevronLeft, Info, MessageSquare, Film, Globe, Clock } from 'lucide-react'

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
    const res = await fetch(`${base}/recommend/${slug}?n=6`, { next: { revalidate: 3600 } })
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
  const posterUrl = movie.poster ? urlFor(movie.poster).width(600).url() : movie.posterUrl || null
  return {
    title: `${movie.title} (${movie.year})`,
    description: movie.synopsis || `Full details for ${movie.title}.`,
    alternates: { canonical: `https://tamilcinemahub.xyz/movies/${slug}` },
  }
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="font-display text-3xl font-black mt-12 mb-6 uppercase tracking-tight text-white">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-black mt-8 mb-4 uppercase tracking-wider text-white/90">{children}</h3>,
    normal: ({ children }: any) => <p className="leading-relaxed mb-6 text-white/50 text-lg font-medium">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-crimson bg-white/[0.02] pl-8 pr-6 py-8 my-10 italic rounded-2xl text-white/40 text-xl leading-relaxed">
        {children}
      </blockquote>
    ),
  },
}

export default async function MovieDetailPage({ params }: MovieDetailProps) {
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) notFound()

  const posterUrl = movie.poster ? urlFor(movie.poster).width(800).quality(90).url() : movie.posterUrl || null
  const rating = movie.rating || 0

  return (
    <div className="bg-ink min-h-screen pb-24 overflow-x-hidden">
      
      {/* ── LUXURY HERO ── */}
      <div className="relative pt-40 pb-20 border-b border-white/5">
        {/* Background depth blobs */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-crimson/5 to-transparent" />
           <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet/10 rounded-full blur-[150px]" />
        </div>

        <div className="section-container relative z-10">
          <Link href="/movies" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all mb-12 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Collection Index
          </Link>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* 3D-Look Poster */}
            <div className="w-full max-w-[320px] mx-auto lg:mx-0 flex-shrink-0">
               <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 relative group perspective-container">
                  {posterUrl ? (
                    <Image src={posterUrl} alt={movie.title} fill sizes="320px" className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
                  ) : (
                    <div className="w-full h-full bg-white/[0.03] flex items-center justify-center"><Film size={64} className="text-white/5" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
               </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-center lg:text-left">
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  {movie.genre?.map(g => (
                    <span key={g} className="px-4 py-1.5 rounded-full glass border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                      {g}
                    </span>
                  ))}
               </div>

               <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.85] uppercase mb-8">
                 {movie.title}
               </h1>

               {movie.titleTanglish && (
                 <p className="text-2xl md:text-3xl font-serif italic text-crimson mb-10">&ldquo;{movie.titleTanglish}&rdquo;</p>
               )}

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
                  <DetailStat icon={<Star className="text-gold fill-gold" />} label="Database Rating" value={`${rating.toFixed(1)} / 5.0`} />
                  <DetailStat icon={<Calendar className="text-violet" />} label="Release Year" value={String(movie.year)} />
                  <DetailStat icon={<Tv className="text-teal" />} label="Digital Platform" value={movie.ottPlatform || 'Theatrical'} />
                  <DetailStat icon={<Globe className="text-crimson" />} label="Region" value="Tamil Nadu" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO CONTENT GRID ── */}
      <div className="section-container">
        <div className="bento-grid grid-fix">
           
           {/* Synopsis - Large Card */}
           <div className="col-span-12 lg:col-span-8 bento-card p-10 md:p-16">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson"><Info size={20} /></div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Narrative Arc</h2>
              </div>
              <p className="text-xl md:text-2xl leading-relaxed text-white/60 font-medium italic mb-12">
                {movie.synopsis || 'Plot architecture is currently being documented by our archivists.'}
              </p>
              
              {movie.review && (
                <div className="mt-16 pt-16 border-t border-white/5">
                   <div className="flex items-center gap-3 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet"><MessageSquare size={20} /></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Critical Synthesis</h2>
                   </div>
                   <div className="prose max-w-none">
                      <PortableText value={movie.review} components={ptComponents} />
                   </div>
                </div>
              )}
           </div>

           {/* Technical Specs - Small Sidebar Card */}
           <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bento-card p-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 pb-4 border-b border-white/5">Technical Log</h3>
                 <div className="space-y-8">
                    <SpecRow label="Director" value={movie.director || 'N/A'} />
                    <SpecRow label="Status" value={movie.year > 2024 ? 'Upcoming' : 'Released'} />
                    <SpecRow label="ID" value={movie._id.slice(-8).toUpperCase()} />
                    <SpecRow label="Archived" value="Premium" />
                 </div>
              </div>

              {/* Cast Snapshot */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="bento-card p-10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Lead Personnel</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {movie.cast.slice(0, 4).map((actor: CastMember, idx) => {
                        const name = typeof actor === 'string' ? actor : actor.name
                        return (
                          <div key={idx} className="group">
                             <div className="aspect-square rounded-2xl overflow-hidden glass border-white/5 mb-3">
                                {typeof actor !== 'string' && actor.photo ? (
                                  <Image src={urlFor(actor.photo).width(200).url()} alt={name} width={200} height={200} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl font-display font-black text-white/10 uppercase">{name.charAt(0)}</div>
                                )}
                             </div>
                             <p className="text-[10px] font-black text-white/80 uppercase truncate">{name}</p>
                          </div>
                        )
                      })}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      <Suspense fallback={<RecommendationSkeleton />}>
        <MovieRecommendations slug={slug} />
      </Suspense>
    </div>
  )
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-5 rounded-3xl glass border-white/5 flex flex-col items-center lg:items-start text-center lg:text-left gap-3">
       <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center">{icon}</div>
       <div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">{label}</div>
          <div className="text-xs font-black text-white uppercase">{value}</div>
       </div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
       <span className="text-[9px] font-black uppercase tracking-widest text-white/10">{label}</span>
       <span className="text-xs font-bold text-white/60 text-right uppercase truncate">{value}</span>
    </div>
  )
}

function RecommendationSkeleton() {
  return (
    <div className="section-container">
       <div className="h-24 w-64 bg-white/5 rounded-[2rem] animate-pulse mb-12" />
       <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse" />
          ))}
       </div>
    </div>
  )
}

async function MovieRecommendations({ slug }: { slug: string }) {
  const recommendations = await getRecommendations(slug)
  if (!recommendations.length) return null
  
  return (
    <section className="section-container border-t border-white/5">
      <div className="mb-16">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-crimson mb-4">Discovery</div>
        <h3 className="text-4xl md:text-6xl font-display font-black text-white uppercase leading-[0.9]">Similar <span className="text-gradient">Narratives</span></h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {recommendations.map((rec, i) => (
          <MovieCardErrorBoundary key={rec._id} title={rec.title}>
            <MovieCard movie={rec} index={i} />
          </MovieCardErrorBoundary>
        ))}
      </div>
    </section>
  )
}
