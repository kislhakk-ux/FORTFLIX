import React, { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { handleImageError } from '../utils/imageHelper';
import { getMovieCreditCost } from '../utils/credits';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  isLiked?: boolean;
  onToggleLike?: (movie: Movie) => void;
  progress?: number;
  useBackdrop?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
  isLiked,
  onToggleLike,
  progress,
  useBackdrop = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getGradientClass = () => {
    const gradients = [
      'from-rose-950/80 via-slate-900 to-neutral-950',
      'from-indigo-950/80 via-slate-900 to-neutral-950',
      'from-emerald-950/80 via-slate-900 to-neutral-950',
      'from-cyan-950/80 via-slate-900 to-neutral-950',
      'from-amber-950/80 via-slate-900 to-neutral-950',
      'from-fuchsia-950/80 via-slate-900 to-neutral-950',
      'from-violet-950/80 via-slate-900 to-neutral-950',
      'from-blue-950/80 via-slate-900 to-neutral-950',
    ];
    const hash = movie.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      id={`movie-card-${movie.id}`}
      className={`relative group rounded-sm overflow-hidden cursor-pointer transition-all duration-300 transform-gpu border border-white/5 hover:border-white/20 bg-[#0d0d0d] ${
        useBackdrop ? 'w-64 sm:w-72 flex-shrink-0' : 'w-36 sm:w-44 md:w-52 flex-shrink-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetails(movie)}
    >
      {/* Poster / Backdrop Image */}
      <div className={`relative ${useBackdrop ? 'aspect-video' : 'aspect-[2/3]'} bg-[#121212] overflow-hidden w-full h-full`}>
        {!hasError ? (
          <img
            src={useBackdrop ? movie.backdropUrl : movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className={`w-full h-full flex flex-col justify-between p-3.5 bg-gradient-to-br ${getGradientClass()} select-none`}>
            <div className="flex items-center justify-between">
              <span className="bg-[#E50914] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-xs tracking-wider uppercase">
                FORTflix
              </span>
              <span className="text-[8px] text-emerald-400 font-bold">
                {movie.matchScore}% Match
              </span>
            </div>
            
            <div className="space-y-1 pr-1">
              <p className="text-[11px] sm:text-xs font-black text-white line-clamp-3 leading-snug tracking-tight">
                {movie.title}
              </p>
              <div className="flex items-center space-x-1.5 text-[9px] text-gray-400">
                <span>{movie.releaseYear || movie.year}</span>
                <span>•</span>
                <span>{movie.type === 'tv' ? 'Série' : movie.duration}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
              <span className="text-[8px] bg-white/10 px-1 py-0.2 rounded-xs font-semibold text-gray-300">
                {movie.ageRating}
              </span>
              <span className="text-[8px] text-gray-400 truncate max-w-[65px]">
                {movie.genres.slice(0, 1).join('')}
              </span>
            </div>
          </div>
        )}

        {/* Gradient shadow for text readability - only show when image is loaded successfully */}
        {!hasError && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
        )}

        {/* Netflix Original Badge - only show when image is loaded successfully */}
        {!hasError && movie.isNetflixOriginal && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#E50914] text-white font-black text-[9px] px-1.5 py-0.5 rounded-xs tracking-tighter">
              N
            </span>
          </div>
        )}

        {/* New / HD Badge - only show when image is loaded successfully */}
        {!hasError && movie.isNew && (
          <div className="absolute top-2 right-2">
            <span className="bg-[#E50914] text-white font-bold text-[8px] px-1.5 py-0.5 rounded-xs uppercase tracking-widest">
              NOVO
            </span>
          </div>
        )}

        {/* Bottom Title bar on card for easy scanning - only show when image is loaded successfully */}
        {!hasError && (
          <div className="absolute bottom-2 left-2.5 right-2.5">
            <p className="text-xs font-bold text-white truncate drop-shadow-md">
              {movie.title}
            </p>
          </div>
        )}

        {/* Continue Watching Progress Bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div
              className="h-full bg-[#E50914]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Hover Card Overlay (Editorial Cinema Preview Style) */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-black/60 p-3 flex flex-col justify-between animate-fadeIn z-20">
          {/* Top Info */}
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 text-[10px] font-bold tracking-wide">
              {movie.matchScore}% Match
            </span>
            <span className="text-[9px] px-1.5 py-0.2 border border-white/20 text-gray-300 rounded-xs uppercase tracking-wider">
              {movie.ageRating}
            </span>
          </div>

          {/* Title & Quick Controls */}
          <div>
            <p className="text-xs font-bold text-white truncate mb-2 uppercase tracking-tight">
              {movie.title}
            </p>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-200">
                <span>{getMovieCreditCost(movie)} créditos</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  id={`card-play-${movie.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(movie);
                  }}
                  className="w-8 h-8 bg-white text-black rounded-md flex items-center justify-center hover:bg-gray-200 transition transform hover:scale-105 shadow-md cursor-pointer"
                  title="Assistir agora"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>

                <button
                  id={`card-watchlist-${movie.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(movie);
                  }}
                  className="w-8 h-8 bg-white/10 border border-white/20 text-white rounded-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                  title={isInWatchlist ? 'Remover da Lista' : 'Adicionar à Lista'}
                >
                  {isInWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                {onToggleLike && (
                  <button
                    id={`card-like-${movie.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(movie);
                    }}
                    className={`w-8 h-8 bg-white/10 border border-white/20 rounded-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer ${
                      isLiked ? 'text-[#E50914] border-[#E50914]' : 'text-white'
                    }`}
                    title="Gostei"
                  >
                    <ThumbsUp className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>

              <button
                id={`card-more-info-${movie.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(movie);
                }}
                className="w-8 h-8 bg-white/10 border border-white/20 text-white rounded-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                title="Mais detalhes"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Genres Tagline */}
            <div className="mt-2 flex items-center space-x-1 text-[9px] text-gray-400 truncate tracking-wide">
              <span>{movie.genres.slice(0, 2).join(' • ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
