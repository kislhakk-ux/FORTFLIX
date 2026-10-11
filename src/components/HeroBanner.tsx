import React, { useState } from 'react';
import { Play, Info, Plus, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { getSafeBackdrop } from '../utils/imageHelper';
import { Movie } from '../types';
import { handleImageError } from '../utils/imageHelper';
import { getMovieCreditCost } from '../utils/credits';

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div
      id="hero-banner"
      className="relative w-full h-[75vh] md:h-[85vh] lg:h-[90vh] bg-[#050505] overflow-hidden"
    >
      {/* Background Backdrop Image with Editorial Gradients */}
      <div className="absolute inset-0">
        <img
          src={getSafeBackdrop(movie.backdropUrl, movie.title)}
          alt={movie.title}
          onError={(e) => handleImageError(e, 'backdrop')}
          className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Editorial Gradients & Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-center pb-20 pt-24">
        <div className="max-w-2xl space-y-4">
          {/* Top Editorial Eyebrow & Badges */}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.3em] text-[#E50914] uppercase">
              {movie.isNetflixOriginal ? 'Original FORTflix Exclusivo' : 'Em Destaque no Cinema'}
            </span>
            {movie.isTop10 && (
              <span className="px-2 py-0.5 border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-white font-bold bg-black/40">
                Top 10 Hoje
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] drop-shadow-2xl">
            {movie.title.toUpperCase()}
          </h1>

          {/* Metadata info */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-300 font-medium flex-wrap gap-y-1">
            <span className="text-emerald-400 font-bold">{movie.matchScore}% Match</span>
            <span className="border border-white/20 px-2 py-0.5 text-[10px] rounded text-gray-300 uppercase tracking-wider font-semibold">
              4K Ultra HD
            </span>
            <span className="text-gray-300">{movie.releaseYear}</span>
            <span className="text-gray-300">{movie.duration}</span>
            <span className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-amber-200">
              {getMovieCreditCost(movie)} créditos
            </span>
            <span className="border border-white/10 px-1.5 py-0.2 text-[10px] rounded text-gray-400">
              {movie.ageRating}
            </span>
            <span className="text-gray-400 hidden sm:inline">• {movie.genres.join(', ')}</span>
          </div>

          {/* Overview / Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl font-normal">
            {movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            {/* Play Button */}
            <button
              id="hero-play-button"
              onClick={() => onPlay(movie)}
              className="bg-white text-black px-8 sm:px-10 py-3 rounded-md font-bold text-sm sm:text-base flex items-center hover:bg-gray-200 transition-colors shadow-2xl cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current mr-2.5" />
              <span>Assistir</span>
            </button>

            {/* More Info Button */}
            <button
              id="hero-more-info-button"
              onClick={() => onOpenDetails(movie)}
              className="bg-gray-500/30 text-white backdrop-blur-md px-7 sm:px-9 py-3 rounded-md font-bold text-sm sm:text-base flex items-center hover:bg-gray-500/50 transition-colors border border-white/10 cursor-pointer"
            >
              <Info className="w-4 h-4 mr-2" />
              <span>Mais Informações</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              id="hero-watchlist-button"
              onClick={() => onToggleWatchlist(movie)}
              className="p-3 rounded-md bg-white/5 border border-white/15 text-white hover:bg-white/10 transition cursor-pointer"
              title={isInWatchlist ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
            >
              {isInWatchlist ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Right Corner: Audio & Age Rating */}
        <div className="absolute right-4 sm:right-8 bottom-24 flex items-center space-x-3">
          <button
            id="hero-audio-toggle"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-black/60 border border-white/20 text-gray-300 hover:text-white hover:border-white transition cursor-pointer"
            title={isMuted ? 'Desmutar prévia' : 'Mutar prévia'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="bg-black/70 border border-white/20 py-1 px-3 text-[11px] font-bold text-gray-200 uppercase tracking-widest rounded-xs">
            {movie.ageRating}
          </div>
        </div>
      </div>
    </div>
  );
};
