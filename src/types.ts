export interface Movie {
  id: string;
  tmdbId: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  releaseYear: number;
  rating: number; // e.g. 8.8
  matchScore: number; // e.g. 97 (% relevance)
  ageRating: 'Livre' | '10+' | '12+' | '14+' | '16+' | '18+';
  duration: string; // e.g. "2h 15min" or "4 Temporadas"
  type: 'movie' | 'tv';
  genres: string[];
  cast: string[];
  director?: string;
  tags?: string[];
  isNetflixOriginal?: boolean;
  isTop10?: boolean;
  top10Rank?: number;
  isNew?: boolean;
  isTrending?: boolean;
  seasonsCount?: number;
  seasons?: Season[];
  trailerUrl?: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodesCount: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview: string;
  duration: string;
  thumbnailUrl: string;
  stillUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  language: string;
  autoplayNext: boolean;
  watchlist: string[]; // movie IDs
  likedIds: string[];
  dislikedIds: string[];
  /** Credits and unlocked titles are stored locally in this front-end prototype. */
  credits?: number;
  unlockedMovieIds?: string[];
  creditHistory?: CreditHistoryEntry[];
  continueWatching: {
    movieId: string;
    progress: number; // 0 - 100 percentage
    season?: number;
    episode?: number;
    lastWatchedAt: number;
  }[];
}

export interface CreditHistoryEntry {
  id: string;
  amount: number;
  description: string;
  createdAt: number;
}

export interface PlayerServer {
  id: string;
  name: string;
  tag: string;
  speed: string;
  quality: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number, imdbId?: string) => string;
}

export interface AdBlockStats {
  blockedPopups: number;
  blockedRedirects: number;
  blockedBanners: number;
  shieldActive: boolean;
  lastBlockedAt?: string;
}
