import { Movie, PlayerServer, UserProfile } from '../types';
import { MOVIES_1000_DATABASE } from './catalog1000';

export const PLAYER_SERVERS: PlayerServer[] = [
  {
    id: 'embedmovies',
    name: 'EmbedMovies (Oficial)',
    tag: 'Recomendado',
    speed: 'Ultra Rápido',
    quality: 'Full HD / 4K',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://myembed.biz/filme/${tmdbId}`;
      }
      return `https://myembed.biz/serie/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed VIP',
    tag: 'Sem Anúncios',
    speed: 'Rápido',
    quality: 'Full HD',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'vidsrc',
    name: 'VidSrc CC',
    tag: 'Multi-Áudio',
    speed: 'Estável',
    quality: '1080p',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://vidsrc.pm/embed/movie/${tmdbId}`;
      }
      return `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed 4K',
    tag: 'Dublado/Legendado',
    speed: 'Ultra HD',
    quality: '4K HDR',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
      }
      return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'embedmovies_alt',
    name: 'EmbedMovies Server 2',
    tag: 'Backup',
    speed: 'Rápido',
    quality: 'HD',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId || tmdbId;
      if (type === 'movie') {
        return `https://embedmovies.org/embed/movie/${id}`;
      }
      return `https://embedmovies.org/embed/tv/${id}/${season}/${episode}`;
    },
  },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'prof-1',
    name: 'Principal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    isKids: false,
    language: 'Português (Brasil)',
    autoplayNext: true,
    watchlist: ['m-1', 's-1', 'm-3', 's-2'],
    likedIds: ['m-1', 'm-2', 's-1'],
    dislikedIds: [],
    credits: 0,
    unlockedMovieIds: [],
    creditHistory: [],
    continueWatching: [
      { movieId: 'm-1', progress: 65, lastWatchedAt: Date.now() - 3600000 },
      { movieId: 's-1', progress: 42, season: 4, episode: 1, lastWatchedAt: Date.now() - 86400000 },
      { movieId: 'm-4', progress: 88, lastWatchedAt: Date.now() - 172800000 },
    ],
  },
  {
    id: 'prof-2',
    name: 'Família',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    isKids: false,
    language: 'Português (Brasil)',
    autoplayNext: true,
    watchlist: ['m-2', 'm-6', 's-4'],
    likedIds: ['m-2'],
    dislikedIds: [],
    credits: 0,
    unlockedMovieIds: [],
    creditHistory: [],
    continueWatching: [
      { movieId: 'm-2', progress: 30, lastWatchedAt: Date.now() - 4800000 },
    ],
  },
  {
    id: 'prof-3',
    name: 'Kids',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces',
    isKids: true,
    language: 'Português (Brasil)',
    autoplayNext: true,
    watchlist: ['m-8', 'm-9', 'm-10'],
    likedIds: ['m-8', 'm-9'],
    dislikedIds: [],
    credits: 0,
    unlockedMovieIds: [],
    creditHistory: [],
    continueWatching: [
      { movieId: 'm-8', progress: 50, lastWatchedAt: Date.now() - 7200000 },
    ],
  },
];

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=faces',
];

// 1,000+ Movies Database
export const MOVIES_DATABASE: Movie[] = MOVIES_1000_DATABASE;

export const GENRE_CATEGORIES = [
  'Todos',
  'Ação',
  'Ficção Científica',
  'Comédia',
  'Drama',
  'Animação',
  'Terror',
  'Aventura',
  'Crime',
  'Mistério',
  'Família',
  'História',
  'Fantasia',
  'Romance'
];
