import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client } from '../../../sanity/client'
import { movieBySlugQuery } from '../../../lib/queries'
import { urlFor } from '../../../sanity/lib/image'
import MovieCard, { Movie } from '../../../components/MovieCard'
import MovieCardErrorBoundary from '../../../components/MovieCardErrorBoundary'
import { Star, ChevronLeft, Calendar, User, Tv, Info, Globe, Play } from 'lucide-react'

interface MovieDetailProps {
  params: Promise<{ slug: string }>
}

async function getMovieData(slug: string) {
  try {
    const movie = await client.fetch<any>(movieBySlugQuery, { slug })
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
        _id, title, "slug": slug.current, year, director, rating, poster, posterUrl, genre
      }`,
      { recSlugs }
    )
  } catch { return [] }
}

export async function generateMetadata({ params }: MovieDetailProps): Promise<Metadata> {
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) return { title: 'Movie Not Found' }
  return {
    title: `${movie.title} (${movie.year}) | Archive`,
    description: movie.synopsis || `Digital record for ${movie.title}.`,
    alternates: { canonical: `https://tamilcinemahub.xyz/movies/${slug}` },
  }
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="text-3xl font-display font-black text-white mt-12 mb-6 uppercase tracking-tight">{children}</h2>,
    normal: ({ children }: any) => <p className="text-lg text-white/50 leading-relaxed mb-8">{children}</p>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-crimson pl-8 italic text-white/40 text-xl py-4 my-10">{children}</blockquote>,
  },
}

export default async function MovieDetailPage({ params }: MovieDetailProps) {
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) notFound()

  const recommendations = await getRecommendations(slug)
  const posterUrl = movie.poster ? urlFor(movie.poster).width(800).url() : movie.posterUrl || null

  return (
    <main className="bg-ink min-h-screen pb-32">
      
      {/* ── EDITORIAL HERO ── */}
      <section className="relative pt-48 pb-20 border-b border-white/5">
        <div className="main-container relative z-10">
           
           <Link href="/movies" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all mb-16 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Archive Collection
           </Link>

           <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-start">
              
              {/* Massive Poster */}
              <div className="w-full lg:w-[400px] flex-shrink-0">
                 <div className="aspect-[2/3] rounded-[2rem] overflow-hidden bg-coal relative shadow-2xl border border-white/5">
                    {posterUrl ? (
                      <Image src={posterUrl} alt={movie.title} fill sizes="400px" className="object-cover" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/5"><Film size={64} /></div>
                    )}
                 </div>
              </div>

              {/* Data Focal */}
              <div className="flex-1">
                 <div className="flex flex-wrap gap-3 mb-10">
                    {movie.genre?.map((g: string) => (
                      <span key={g} className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-white/40">
                         {g}
                      </span>
                    ))}
                 </div>

                 <h1 className="text-h2 lg:text-h1 mb-10">{movie.title}</h1>
                 
                 {movie.titleTanglish && (
                   <p className="text-2xl md:text-3xl font-serif italic text-crimson mb-12 opacity-80">&ldquo;{movie.titleTanglish}&rdquo;</p>
                 )}

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/5">
                    <DataPoint icon={<Star size={14} className="text-crimson fill-crimson" />} label="Database Score" value={`${movie.rating.toFixed(1)} / 5.0`} />
                    <DataPoint icon={<Calendar size={14} className="text-white/40" />} label="Release Year" value={String(movie.year)} />
                    <DataPoint icon={<Tv size={14} className="text-white/40" />} label="Availability" value={movie.ottPlatform || 'Theatrical'} />
                    <DataPoint icon={<Globe size={14} className="text-white/40" />} label="Origins" value="Regional" />
                 </div>
              </div>

           </div>

        </div>
      </section>

      {/* ── NARRATIVE CONTENT ── */}
      <section className="py-24">
         <div className="main-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
               
               <div className="lg:col-span-8">
                  <p className="text-2xl md:text-3xl font-medium leading-tight text-white/60 mb-16 italic border-l-4 border-white/5 pl-10 uppercase tracking-tighter">
                    {movie.synopsis || "Plot record under editorial review."}
                  </p>

                  <div className="prose max-w-none">
                     {movie.review ? <PortableText value={movie.review} components={ptComponents} /> : <p className="italic text-white/20">Critical analysis pending archive synchronization.</p>}
                  </div>
               </div>

               <div className="lg:col-span-4">
                  <div className="sticky top-40 space-y-12">
                     <div className="luxury-card p-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 pb-4 border-b border-white/5">Technical Personnel</h4>
                        <div className="space-y-6">
                           <InfoRow label="Director" value={movie.director || "Master Controller"} />
                           <InfoRow label="ID Hash" value={movie._id.slice(-8).toUpperCase()} />
                           <InfoRow label="Status" value="Archived" />
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ── RECOMMENDATIONS ── */}
      {recommendations.length > 0 && (
        <section className="py-24 border-t border-white/5">
           <div className="main-container">
              <div className="mb-16 flex items-center justify-between">
                 <h3 className="text-title">Similar <span className="text-crimson">Artifacts</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
                 {recommendations.map((rec, i) => (
                   <MovieCardErrorBoundary key={rec._id} title={rec.title}>
                      <MovieCard movie={rec} index={i} />
                   </MovieCardErrorBoundary>
                 ))}
              </div>
           </div>
        </section>
      )}

    </main>
  )
}

function DataPoint({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-3">
       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
          {icon} {label}
       </div>
       <div className="text-sm font-black text-white uppercase">{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
       <span className="text-[9px] font-black uppercase tracking-widest text-white/10">{label}</span>
       <span className="text-xs font-bold text-white/60 uppercase truncate">{value}</span>
    </div>
  )
}

function Film({ size, className }: { size: number, className?: string }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
         <line x1="7" y1="2" x2="7" y2="22"/>
         <line x1="17" y1="2" x2="17" y2="22"/>
         <line x1="2" y1="12" x2="22" y2="12"/>
         <line x1="2" y1="7" x2="7" y2="7"/>
         <line x1="2" y1="17" x2="7" y2="17"/>
         <line x1="17" y1="17" x2="22" y2="17"/>
         <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
   )
}
