import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { Movie } from '../types';
import { handleImageError } from '../utils/imageHelper';

interface Top10RowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  watchlistIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  title,
  movies,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const top10List = [...movies]
    .sort((a, b) => (a.top10Rank || 99) - (b.top10Rank || 99))
    .slice(0, 10);

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

  return (
    <div id="top-10-row-section" className="relative py-6 group">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
          <span>{title}</span>
          <span className="text-[10px] bg-[#E50914] text-white px-2 py-0.5 rounded-xs font-black tracking-widest uppercase">
            BRASIL
          </span>
        </h2>
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            id="top10-arrow-left"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-[#050505]/80 hover:bg-[#050505] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md border-r border-white/10"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none px-4 sm:px-8 py-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {top10List.map((movie, index) => {
            const rank = index + 1;
            const isInWatchlist = watchlistIds.includes(movie.id);

            return (
              <div
                key={movie.id}
                id={`top10-card-${rank}`}
                className="flex items-center flex-shrink-0 cursor-pointer group/card relative"
                onClick={() => onOpenDetails(movie)}
              >
                {/* Stylized Giant Editorial Number */}
                <div className="relative select-none -mr-4 sm:-mr-6 z-10">
                  <span
                    className="text-7xl sm:text-8xl md:text-9xl font-black italic tracking-tighter"
                    style={{
                      color: '#050505',
                      WebkitTextStroke: '3px #444444',
                      textShadow: '0 0 16px rgba(0,0,0,0.9)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="w-28 sm:w-36 md:w-44 aspect-[2/3] bg-[#0d0d0d] rounded-sm overflow-hidden shadow-2xl relative z-20 group-hover/card:scale-105 transition-all duration-300 border border-white/5 group-hover/card:border-white/20">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    onError={(e) => handleImageError(e, 'poster')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Netflix original top badge */}
                  {movie.isNetflixOriginal && (
                    <div className="absolute top-1 left-1 bg-[#E50914] text-white font-black text-[8px] px-1 py-0.2 rounded-xs">
                      N
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                    <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{movie.title}</p>
                    <div className="flex items-center space-x-1.5 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(movie);
                        }}
                        className="w-7 h-7 bg-white text-black rounded-md flex items-center justify-center hover:scale-105 transition cursor-pointer shadow-md"
                        title="Assistir agora"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(movie);
                        }}
                        className="w-7 h-7 bg-white/10 border border-white/20 text-white rounded-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                        title="Minha Lista"
                      >
                        {isInWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            id="top10-arrow-right"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-[#050505]/80 hover:bg-[#050505] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md border-l border-white/10"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
};
