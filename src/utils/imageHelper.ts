// Image fallback and banner optimizer for FORTflix
import React from 'react';
import { Movie } from '../types';

export const BACKDROP_FALLBACKS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&q=80',
  'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80',
];

export const POSTER_FALLBACKS = [
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80',
];

export function getSafePoster(url?: string, title?: string): string {
  if (url && url.startsWith('http') && !url.includes('undefined') && !url.includes('null')) {
    return url;
  }
  // Generate reliable deterministic fallback based on title or random
  const index = Math.abs((title || 'poster').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % POSTER_FALLBACKS.length;
  return POSTER_FALLBACKS[index];
}

export function getSafeBackdrop(url?: string, title?: string): string {
  if (url && url.startsWith('http') && !url.includes('undefined') && !url.includes('null')) {
    return url;
  }
  const index = Math.abs((title || 'backdrop').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % BACKDROP_FALLBACKS.length;
  return BACKDROP_FALLBACKS[index];
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackType: 'poster' | 'backdrop' = 'poster') {
  const target = e.currentTarget;
  const fallback = fallbackType === 'backdrop' ? BACKDROP_FALLBACKS[0] : POSTER_FALLBACKS[0];
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
