// MoviesPageClient.tsx – Displays movie grid with optional 5‑star filter
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import type { Movie } from '@/lib/types';
// Removed normalizeRating import as we now use raw rating
import MovieCard from '@/components/ui/MovieCard';
import SearchInput from '@/components/ui/SearchInput';
import GenreChip from '@/components/ui/GenreChip';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import AdUnit from '@/components/ui/AdUnit';

interface Props {
  initialMovies: Movie[];
  totalCount: number;
  genres: string[];
  initialGenre: string;
  initialQ: string;
  currentPage: number;
  totalPages: number;
}

export default function MoviesPageClient({
  initialMovies,
  totalCount,
  genres,
  initialGenre,
  initialQ,
  currentPage,
  totalPages,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [showFiveStarsOnly, setShowFiveStarsOnly] = useState(false);
  const router = useRouter();

  const displayMovies = showFiveStarsOnly
    ? initialMovies.filter((m) => m.rating === 5)
    : initialMovies;

  function applyFilter(genre: string) {
    const sp = new URLSearchParams();
    if (genre && genre !== 'All') sp.set('genre', genre);
    if (initialQ) sp.set('q', initialQ);
    router.push(`/movies?${sp.toString()}`);
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          label="Collection"
          title="Movies"
          description={`Browse ${totalCount.toLocaleString()} Tamil films`}
          action={
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Filter size={14} />
              Filters
              {initialGenre && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              )}
            </button>
          }
        />

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <SearchInput defaultValue={initialQ} placeholder="Search movies…" basePath="/movies" />
          {initialGenre && (
            <button
              onClick={() => applyFilter('')}
              className="flex items-center gap-1.5 text-xs text-accent-gold bg-accent-gold-muted rounded-full px-3 py-1.5 hover:bg-accent-gold/20 transition-colors"
            >
              {initialGenre} <X size={12} />
            </button>
          )}
        </div>

        {/* Genre chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            <GenreChip genre="All" active={!initialGenre} onClick={() => applyFilter('')} />
            {genres.map((g) => (
              <GenreChip key={g} genre={g} active={initialGenre === g} onClick={() => applyFilter(g)} />
            ))}
          </div>
        )}

        {/* 5‑star filter toggle */}
        <button
          onClick={() => setShowFiveStarsOnly(!showFiveStarsOnly)}
          className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {showFiveStarsOnly ? 'Show All' : '5★ Only'}
        </button>

        {/* Ad: Above movie grid */}
        <div className="mb-8">
          <AdUnit adSlot="0000000005" className="max-w-4xl mx-auto" minHeight="90px" />
        </div>

        {/* Movie grid */}
        {displayMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayMovies.map((movie, i) => (
              <MovieCard key={movie._id} movie={movie} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No movies found"
            description="Try adjusting your search or filter criteria."
          />
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/movies"
          params={{ genre: initialGenre, q: initialQ }}
        />
      </div>
    </div>
  );
}
