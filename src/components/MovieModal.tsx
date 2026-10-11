import React, { useState } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, Sparkles, ChevronDown, Clock, Coins } from 'lucide-react';
import { Movie, Episode } from '../types';
import { handleImageError } from '../utils/imageHelper';
import { getMovieCreditCost } from '../utils/credits';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie, season?: number, episode?: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  isLiked: boolean;
  onToggleLike: (movie: Movie) => void;
  allMovies: Movie[];
  isUnlocked: boolean;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
  isLiked,
  onToggleLike,
  allMovies,
  isUnlocked,
}) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);

  if (!movie) return null;

  const currentSeason = movie.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || movie.seasons?.[0];

  // Similar movies recommendation
  const similarMovies = allMovies
    .filter(m => m.id !== movie.id && (m.genres.some(g => movie.genres.includes(g)) || m.type === movie.type))
    .slice(0, 6);

  return (
    <div
      id="movie-details-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="movie-details-modal-content"
        className="relative w-full max-w-4xl bg-[#090909] rounded-sm overflow-hidden shadow-2xl text-white my-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-black/80 hover:bg-white text-white hover:text-black rounded-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Backdrop Banner */}
        <div className="relative aspect-video sm:aspect-[16/9] md:aspect-[21/9] w-full bg-[#050505]">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            onError={(e) => handleImageError(e, 'backdrop')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent" />

          {/* Banner Actions */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="space-y-3 max-w-lg">
              <h2 className="text-2xl sm:text-4xl font-black drop-shadow-lg tracking-tight uppercase">
                {movie.title}
              </h2>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  id="modal-play-btn"
                  onClick={() => onPlay(movie, selectedSeasonNumber, 1)}
                  className="flex items-center space-x-2 bg-white text-black px-5 sm:px-7 py-2.5 rounded-md font-bold text-sm sm:text-base hover:bg-gray-200 transition shadow-xl cursor-pointer"
                >
                  {isUnlocked
                    ? <Play className="w-4 h-4 fill-current mr-1" />
                    : <Coins className="w-4 h-4 mr-1" />}
                  <span>{isUnlocked ? 'Assistir agora' : 'Assistir por ' + getMovieCreditCost(movie) + ' créditos'}</span>
                </button>

                <button
                  id="modal-watchlist-btn"
                  onClick={() => onToggleWatchlist(movie)}
                  className="w-10 h-10 bg-white/10 border border-white/20 rounded-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                  title="Minha Lista"
                >
                  {isInWatchlist ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  id="modal-like-btn"
                  onClick={() => onToggleLike(movie)}
                  className={`w-10 h-10 bg-white/10 border rounded-md flex items-center justify-center transition cursor-pointer ${
                    isLiked ? 'text-[#E50914] border-[#E50914]' : 'text-white border-white/20 hover:bg-white/20'
                  }`}
                  title="Gostei"
                >
                  <ThumbsUp className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <span className="bg-black/80 border border-white/20 px-2.5 py-1 rounded-xs text-[11px] font-bold uppercase tracking-wider">
                {movie.ageRating}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Synopsis & Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-300 flex-wrap gap-y-1">
                <span className="text-emerald-400 font-bold">{movie.matchScore}% Match</span>
                <span>{movie.releaseYear}</span>
                <span className="px-1.5 py-0.2 border border-white/20 rounded-xs text-[10px] uppercase font-bold">
                  {movie.ageRating}
                </span>
                <span>{movie.duration}</span>
                <span className="px-1.5 py-0.5 border border-white/10 rounded-xs text-[10px] font-semibold text-gray-300 tracking-wider">
                  ULTRA HD 4K
                </span>
              </div>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                {movie.overview}
              </p>

              {movie.tags && (
                <div className="flex items-center space-x-2 flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-gray-400">Marcadores:</span>
                  {movie.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Cast & Director */}
            <div className="space-y-3 text-xs sm:text-sm border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-4 md:pt-0">
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Elenco:</span>
                <span className="text-gray-200 leading-snug">{movie.cast.join(', ')}</span>
              </div>

              {movie.director && (
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Direção:</span>
                  <span className="text-gray-200">{movie.director}</span>
                </div>
              )}

              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Gêneros:</span>
                <span className="text-gray-200">{movie.genres.join(', ')}</span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Servidor Player:</span>
                <span className="text-emerald-400 font-semibold">EmbedMovies API (Sem Anúncios)</span>
              </div>
            </div>
          </div>

          {/* Series Episodes List (If TV show) */}
          {movie.type === 'tv' && movie.seasons && movie.seasons.length > 0 && (
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">Episódios</h3>
                {movie.seasons.length > 1 && (
                  <div className="relative">
                    <select
                      id="season-selector-dropdown"
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                      className="bg-[#121212] text-white text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-md border border-white/20 focus:outline-none cursor-pointer"
                    >
                      {movie.seasons.map((s) => (
                        <option key={s.seasonNumber} value={s.seasonNumber}>
                          {s.title} ({s.episodesCount} episódios)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Episodes Grid/List */}
              <div className="space-y-2">
                {currentSeason?.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    id={`episode-row-${ep.id}`}
                    onClick={() => onPlay(movie, ep.seasonNumber, ep.episodeNumber)}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3.5 rounded-sm hover:bg-white/5 transition cursor-pointer group border border-white/5 hover:border-white/20 bg-[#0d0d0d]"
                  >
                    <span className="text-lg font-bold text-gray-500 group-hover:text-white sm:w-6 text-center">
                      {ep.episodeNumber}
                    </span>

                    <div className="relative w-full sm:w-36 aspect-video bg-[#141414] rounded-xs overflow-hidden flex-shrink-0">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        onError={(e) => handleImageError(e, 'backdrop')}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#E50914] transition truncate">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-gray-400 flex items-center space-x-1 flex-shrink-0 ml-2">
                          <Clock className="w-3 h-3" />
                          <span>{ep.duration}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {ep.overview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Recommendations */}
          {similarMovies.length > 0 && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold text-white mb-4 tracking-tight">Títulos Semelhantes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {similarMovies.map((similar) => (
                  <div
                    key={similar.id}
                    id={`similar-movie-${similar.id}`}
                    onClick={() => {
                      onClose();
                      onPlay(similar);
                    }}
                    className="bg-[#0d0d0d] rounded-sm overflow-hidden cursor-pointer hover:border-white/30 transition group flex flex-col border border-white/5"
                  >
                    <div className="relative aspect-video bg-[#141414]">
                      <img
                        src={similar.backdropUrl || similar.posterUrl}
                        alt={similar.title}
                        onError={(e) => handleImageError(e, 'backdrop')}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded-xs text-[9px] font-bold border border-white/10 uppercase">
                        {similar.ageRating}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-white truncate mb-1">{similar.title}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-2">{similar.overview}</p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="text-emerald-400 font-bold">{similar.matchScore}% Match</span>
                        <span>{similar.releaseYear}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
