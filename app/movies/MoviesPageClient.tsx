// MoviesPageClient.tsx – Displays movie grid with optional 5‑star filter
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, X, ArrowUpDown, Calendar } from 'lucide-react';
import type { Movie } from '@/lib/types';
// Removed normalizeRating import as we now use raw rating
import MovieCard from '@/components/ui/MovieCard';
import SearchInput from '@/components/ui/SearchInput';
import GenreChip from '@/components/ui/GenreChip';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import AdSenseBanner from '@/components/ui/AdSenseBanner';

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
  const [sortBy, setSortBy] = useState<'default' | 'rating-desc' | 'rating-asc' | 'year-desc' | 'year-asc' | 'title-asc'>('default');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const router = useRouter();

  // All available genres from props
  const allGenres = genres;

  // Apply sorting and advanced filters
  const displayMovies = useMemo(() => {
    let filtered = showFiveStarsOnly
      ? initialMovies.filter((m) => m.rating === 5)
      : initialMovies;

    // Multi-genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((m) =>
        m.genre?.some((g) => selectedGenres.includes(g))
      );
    }

    // Year range filter
    const fromYear = yearRange.from ? parseInt(yearRange.from) : 0;
    const toYear = yearRange.to ? parseInt(yearRange.to) : 9999;
    if (fromYear || toYear < 9999) {
      filtered = filtered.filter((m) => m.year >= fromYear && m.year <= toYear);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'rating-desc':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'rating-asc':
        sorted.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
        break;
      case 'year-desc':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        sorted.sort((a, b) => a.year - b.year);
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return sorted;
  }, [initialMovies, showFiveStarsOnly, sortBy, selectedGenres, yearRange]);

  function applyFilter(genre: string) {
    const sp = new URLSearchParams();
    if (genre && genre !== 'All') sp.set('genre', genre);
    if (initialQ) sp.set('q', initialQ);
    router.push(`/movies?${sp.toString()}`);
  }

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
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

        {/* Advanced filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Sort dropdown */}
          <div className="relative">
            <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-7 pr-6 py-2 rounded-lg bg-bg-card border border-border text-xs text-text-secondary hover:text-text-primary focus:outline-none focus:border-accent-gold/50 transition-colors cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="rating-desc">Rating ↓</option>
              <option value="rating-asc">Rating ↑</option>
              <option value="year-desc">Newest</option>
              <option value="year-asc">Oldest</option>
              <option value="title-asc">A → Z</option>
            </select>
          </div>

          {/* 5-star toggle */}
          <button
            onClick={() => setShowFiveStarsOnly(!showFiveStarsOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
              showFiveStarsOnly
                ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            5★ Only
          </button>

          {/* Year range inputs */}
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-text-muted" />
            <input
              type="number"
              placeholder="From"
              value={yearRange.from}
              onChange={(e) => setYearRange((p) => ({ ...p, from: e.target.value }))}
              className="w-16 px-2 py-2 rounded-lg bg-bg-card border border-border text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
              min={1930}
              max={2030}
            />
            <span className="text-text-muted text-xs">–</span>
            <input
              type="number"
              placeholder="To"
              value={yearRange.to}
              onChange={(e) => setYearRange((p) => ({ ...p, to: e.target.value }))}
              className="w-16 px-2 py-2 rounded-lg bg-bg-card border border-border text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
              min={1930}
              max={2030}
            />
          </div>
        </div>

        {/* Multi-genre chips (when filters open) */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            <GenreChip genre="All" active={!initialGenre && selectedGenres.length === 0} onClick={() => { applyFilter(''); setSelectedGenres([]) }} />
            {allGenres.map((g) => (
              <GenreChip
                key={g}
                genre={g}
                active={initialGenre === g || selectedGenres.includes(g)}
                onClick={() => { applyFilter(g); toggleGenre(g) }}
              />
            ))}
          </div>
        )}

        {/* Active multi-genre filters */}
        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGenres.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className="flex items-center gap-1.5 text-xs text-accent-gold bg-accent-gold-muted rounded-full px-3 py-1.5 hover:bg-accent-gold/20 transition-colors"
              >
                {g} <X size={12} />
              </button>
            ))}
          </div>
        )}

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

        {/* AdSense */}
        <div className="my-8">
          <AdSenseBanner slot="9784001579" format="horizontal" minHeight={100} />
        </div>

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
