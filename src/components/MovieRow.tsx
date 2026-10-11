import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  id: string;
  title: string;
  subtitle?: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  watchlistIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  likedIds?: string[];
  onToggleLike?: (movie: Movie) => void;
  continueWatchingProgress?: { [movieId: string]: number };
  useBackdrop?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  id,
  title,
  subtitle,
  movies,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  likedIds = [],
  onToggleLike,
  continueWatchingProgress = {},
  useBackdrop = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  const onScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div id={`row-section-${id}`} className="relative py-4 group">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 font-normal">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            id={`row-arrow-left-${id}`}
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-[#050505]/80 hover:bg-[#050505] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md border-r border-white/10"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Scrollable Movies List */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto scrollbar-none px-4 sm:px-8 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              isInWatchlist={watchlistIds.includes(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
              isLiked={likedIds.includes(movie.id)}
              onToggleLike={onToggleLike}
              progress={continueWatchingProgress[movie.id]}
              useBackdrop={useBackdrop}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            id={`row-arrow-right-${id}`}
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-[#050505]/80 hover:bg-[#050505] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md border-l border-white/10"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
};
