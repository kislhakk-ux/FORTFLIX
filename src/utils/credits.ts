import { Movie } from '../types';

/**
 * New releases cost 33 credits; the rest of the catalog costs 27.
 * Keep this rule in one place so every card and purchase uses the same price.
 */
export function getMovieCreditCost(movie: Pick<Movie, 'isNew'>): 27 | 33 {
  return movie.isNew ? 33 : 27;
}

export const REWARDED_AD_CREDITS = 50;
