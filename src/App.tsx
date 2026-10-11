import React, { useState, useEffect, useMemo } from 'react';
import { Movie, UserProfile, AdBlockStats, CreditHistoryEntry } from './types';
import { MOVIES_DATABASE, INITIAL_PROFILES, GENRE_CATEGORIES } from './data/movies';
import { adBlocker } from './services/adBlocker';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieRow } from './components/MovieRow';
import { Top10Row } from './components/Top10Row';
import { MovieModal } from './components/MovieModal';
import { VideoPlayer } from './components/VideoPlayer';
import { ProfileSelector } from './components/ProfileSelector';
import { AdBlockerStatusModal } from './components/AdBlockerStatusModal';
import { MovieCard } from './components/MovieCard';
import { CreditWalletModal } from './components/CreditWalletModal';
import { AdSenseSlot } from './components/AdSenseSlot';
import { getMovieCreditCost } from './utils/credits';
import { requestRewardedAd } from './services/rewardedAds';
import { Film, Tv, Sparkles, Search, Shield, Heart, HelpCircle, Globe, Play, Info } from 'lucide-react';

export default function App() {
  // Profiles State with LocalStorage persistence
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cinestream_profiles');
    const loadedProfiles: UserProfile[] = saved ? JSON.parse(saved) : INITIAL_PROFILES;
    return loadedProfiles.map((profile) => ({
      ...profile,
      credits: Number.isFinite(profile.credits) ? profile.credits : 0,
      unlockedMovieIds: Array.isArray(profile.unlockedMovieIds) ? profile.unlockedMovieIds : [],
      creditHistory: Array.isArray(profile.creditHistory) ? profile.creditHistory : [],
    }));
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return localStorage.getItem('cinestream_active_profile') || INITIAL_PROFILES[0].id;
  });

  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const [isCreditWalletOpen, setIsCreditWalletOpen] = useState(false);

  // App Navigation & Search
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Reset pagination on navigation change
  useEffect(() => {
    setVisibleCount(36);
  }, [activeTab, selectedGenre, searchQuery]);

  // Active Modals & Player State
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<{
    movie: Movie;
    season: number;
    episode: number;
  } | null>(null);

  // AdShield Stats State
  const [adBlockStats, setAdBlockStats] = useState<AdBlockStats>(adBlocker.getStats());
  const [isAdBlockModalOpen, setIsAdBlockModalOpen] = useState(false);

  // Initialize Ad Blocker Script on Mount
  useEffect(() => {
    adBlocker.init();
    const unsubscribe = adBlocker.subscribe((stats) => {
      setAdBlockStats(stats);
    });
    return () => unsubscribe();
  }, []);

  // Save Profiles to LocalStorage
  useEffect(() => {
    localStorage.setItem('cinestream_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('cinestream_active_profile', currentProfileId);
  }, [currentProfileId]);

  const currentProfile = useMemo(() => {
    return profiles.find((p) => p.id === currentProfileId) || profiles[0];
  }, [profiles, currentProfileId]);

  // Profile Management Handlers
  const handleSelectProfile = (profile: UserProfile) => {
    setCurrentProfileId(profile.id);
    setIsProfileSelectorOpen(false);
  };

  const handleAddProfile = (name: string, avatar: string, isKids: boolean) => {
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      name,
      avatar,
      isKids,
      language: 'Português (Brasil)',
      autoplayNext: true,
      watchlist: [],
      likedIds: [],
      dislikedIds: [],
      credits: 0,
      unlockedMovieIds: [],
      creditHistory: [],
      continueWatching: [],
    };
    setProfiles((prev) => [...prev, newProfile]);
    setCurrentProfileId(newProfile.id);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (currentProfileId === profileId && profiles.length > 1) {
      const remaining = profiles.filter((p) => p.id !== profileId);
      setCurrentProfileId(remaining[0].id);
    }
  };

  // Watchlist & Like Handlers
  const handleToggleWatchlist = (movie: Movie) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== currentProfileId) return p;
        const exists = p.watchlist.includes(movie.id);
        return {
          ...p,
          watchlist: exists
            ? p.watchlist.filter((id) => id !== movie.id)
            : [...p.watchlist, movie.id],
        };
      })
    );
  };

  const handleToggleLike = (movie: Movie) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== currentProfileId) return p;
        const exists = p.likedIds.includes(movie.id);
        return {
          ...p,
          likedIds: exists
            ? p.likedIds.filter((id) => id !== movie.id)
            : [...p.likedIds, movie.id],
        };
      })
    );
  };

  // Play Video Handler
  const handlePlayMovie = (movie: Movie, season = 1, episode = 1) => {
    const profile = profiles.find((item) => item.id === currentProfileId);
    const unlockedMovieIds = profile?.unlockedMovieIds || [];
    const alreadyUnlocked = unlockedMovieIds.includes(movie.id);
    const cost = getMovieCreditCost(movie);

    if (!alreadyUnlocked && (profile?.credits || 0) < cost) {
      setIsCreditWalletOpen(true);
      return;
    }

    // Record in continue watching
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== currentProfileId) return p;
        const existing = p.continueWatching.filter((cw) => cw.movieId !== movie.id);
        const hasAccess = (p.unlockedMovieIds || []).includes(movie.id);
        const historyEntry: CreditHistoryEntry = {
          id: 'film-' + movie.id + '-' + Date.now(),
          amount: -cost,
          description: 'Acesso ao título: ' + movie.title,
          createdAt: Date.now(),
        };
        return {
          ...p,
          credits: hasAccess ? (p.credits || 0) : (p.credits || 0) - cost,
          unlockedMovieIds: hasAccess
            ? (p.unlockedMovieIds || [])
            : [...(p.unlockedMovieIds || []), movie.id],
          creditHistory: hasAccess
            ? (p.creditHistory || [])
            : [historyEntry, ...(p.creditHistory || [])].slice(0, 100),
          continueWatching: [
            {
              movieId: movie.id,
              progress: 15,
              season,
              episode,
              lastWatchedAt: Date.now(),
            },
            ...existing,
          ],
        };
      })
    );

    setPlayingMovie({ movie, season, episode });
    setSelectedMovieForModal(null);
  };

  const handleRewardGranted = (amount: number) => {
    setProfiles((prev) =>
      prev.map((profile) => {
        if (profile.id !== currentProfileId) return profile;
        const entry: CreditHistoryEntry = {
          id: 'ad-' + Date.now(),
          amount,
          description: 'Recompensa por anúncio concluído',
          createdAt: Date.now(),
        };
        return {
          ...profile,
          credits: (profile.credits || 0) + amount,
          creditHistory: [entry, ...(profile.creditHistory || [])].slice(0, 100),
        };
      })
    );
  };

  const handleWatchRewardedAd = async () => {
    return requestRewardedAd();
  };

  // Filter Catalog by Kids Mode and Shuffle per Profile Login Session
  const baseMovies = useMemo(() => {
    let list = MOVIES_DATABASE;
    if (currentProfile.isKids) {
      list = MOVIES_DATABASE.filter(
        (m) => m.ageRating === 'Livre' || m.genres.includes('Animação') || m.genres.includes('Família')
      );
    }
    const shuffled = [...list];
    // Fisher-Yates Shuffle to rotate content
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }, [currentProfile.id, currentProfile.isKids]);

  // Hero banner rotation candidates and index state
  const heroMoviesList = useMemo(() => {
    // Use trending movies as candidates for hero banner
    return baseMovies.filter((m) => m.isTrending);
  }, [baseMovies]);

  const [heroIndex, setHeroIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMoviesList.length);
    }, 15000); // rotate every 15 seconds
    return () => clearInterval(interval);
  }, [heroMoviesList]);

  // Featured Banner Movie
  const heroMovie = useMemo(() => {
    if (currentProfile.isKids) {
      // For kids profile, use a dedicated kids movie
      return baseMovies.find((m) => m.id === 'm-6') || baseMovies[0];
    }
    // For other profiles, rotate through heroMoviesList based on heroIndex
    return heroMoviesList[heroIndex] || baseMovies[0];
  }, [heroMoviesList, heroIndex, baseMovies, currentProfile.isKids]);

  // Filtered lists for rows
  const trendingMovies = useMemo(() => baseMovies.filter((m) => m.isTrending), [baseMovies]);
  const netflixOriginals = useMemo(() => baseMovies.filter((m) => m.isNetflixOriginal), [baseMovies]);
  const seriesList = useMemo(() => baseMovies.filter((m) => m.type === 'tv'), [baseMovies]);
  const moviesOnlyList = useMemo(() => baseMovies.filter((m) => m.type === 'movie'), [baseMovies]);
  const actionMovies = useMemo(() => baseMovies.filter((m) => m.genres.includes('Ação')), [baseMovies]);
  const sciFiMovies = useMemo(() => baseMovies.filter((m) => m.genres.includes('Ficção Científica')), [baseMovies]);
  const animationMovies = useMemo(() => baseMovies.filter((m) => m.genres.includes('Animação')), [baseMovies]);

  // Continue Watching list
  const continueWatchingMovies = useMemo(() => {
    return currentProfile.continueWatching
      .map((cw) => {
        const movie = MOVIES_DATABASE.find((m) => m.id === cw.movieId);
        return movie ? { movie, progress: cw.progress } : null;
      })
      .filter(Boolean) as { movie: Movie; progress: number }[];
  }, [currentProfile.continueWatching]);

  const continueWatchingProgressMap = useMemo(() => {
    const map: { [id: string]: number } = {};
    currentProfile.continueWatching.forEach((cw) => {
      map[cw.movieId] = cw.progress;
    });
    return map;
  }, [currentProfile.continueWatching]);

  // Watchlist movies
  const watchlistMovies = useMemo(() => {
    return MOVIES_DATABASE.filter((m) => currentProfile.watchlist.includes(m.id));
  }, [currentProfile.watchlist]);

  // Search & Tab Filter Results
  const filteredCatalog = useMemo(() => {
    let list = baseMovies;

    if (activeTab === 'series') {
      list = list.filter((m) => m.type === 'tv');
    } else if (activeTab === 'movies') {
      list = list.filter((m) => m.type === 'movie');
    } else if (activeTab === 'trending') {
      list = list.filter((m) => m.isTrending || m.isTop10);
    } else if (activeTab === 'mylist') {
      list = watchlistMovies;
    }

    if (selectedGenre !== 'Todos') {
      list = list.filter((m) => m.genres.includes(selectedGenre));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const searchBase = currentProfile.isKids
        ? MOVIES_DATABASE.filter((m) => m.ageRating === 'Livre' || m.genres.includes('Animação') || m.genres.includes('Família'))
        : MOVIES_DATABASE;
      list = searchBase.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.originalTitle?.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.cast.some((c) => c.toLowerCase().includes(q)) ||
          m.director?.toLowerCase().includes(q) ||
          String(m.tmdbId).includes(q)
      );
    }

    return list;
  }, [baseMovies, activeTab, selectedGenre, searchQuery, watchlistMovies]);

  return (
    <div id="fortflix-app-root" className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onOpenManageProfiles={() => setIsProfileSelectorOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedGenre('Todos');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        creditBalance={currentProfile.credits || 0}
        onOpenCreditWallet={() => setIsCreditWalletOpen(true)}
        adBlockStats={adBlockStats}
        onToggleAdShield={() => adBlocker.toggleShield()}
        onOpenAdShieldModal={() => setIsAdBlockModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {searchQuery.trim() ? (
          /* Search Results View */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 space-y-6">
            <AdSenseSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_CATALOG} className="my-2" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Resultados para &quot;<span className="text-[#E50914]">{searchQuery}</span>&quot;
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Encontrados {filteredCatalog.length} títulos no catálogo
                </p>
              </div>
            </div>

            {filteredCatalog.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredCatalog.slice(0, visibleCount).map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayMovie}
                      onOpenDetails={setSelectedMovieForModal}
                      isInWatchlist={currentProfile.watchlist.includes(movie.id)}
                      onToggleWatchlist={handleToggleWatchlist}
                      isLiked={currentProfile.likedIds.includes(movie.id)}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </div>

                {filteredCatalog.length > visibleCount && (
                  <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2">
                    <p className="text-xs text-gray-400">
                      Exibindo {Math.min(visibleCount, filteredCatalog.length)} de {filteredCatalog.length} títulos
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 36)}
                        className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-md hover:bg-gray-200 transition cursor-pointer shadow-lg"
                      >
                        Carregar Mais (+36)
                      </button>
                      <button
                        onClick={() => setVisibleCount(filteredCatalog.length)}
                        className="px-4 py-2.5 bg-white/10 text-white font-semibold text-xs tracking-wider rounded-md hover:bg-white/20 transition cursor-pointer border border-white/10"
                      >
                        Mostrar Todos ({filteredCatalog.length})
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 space-y-4">
                <Search className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-base text-gray-400">Nenhum título encontrado para &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-gray-500">
                  Dica: Tente buscar pelo nome de um filme, ator, diretor ou ID do TMDb.
                </p>
              </div>
            )}
          </div>
        ) : activeTab !== 'home' ? (
          /* Category / Tab View (Séries, Filmes, Bombando, Minha Lista) */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 space-y-6">
            <AdSenseSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_CATALOG} className="my-2" />
            {/* Header & Genre Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeTab === 'series' && 'Séries de TV'}
                  {activeTab === 'movies' && 'Filmes'}
                  {activeTab === 'trending' && 'Bombando no CineStream'}
                  {activeTab === 'mylist' && 'Minha Lista'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === 'mylist'
                    ? `${filteredCatalog.length} títulos adicionados por ${currentProfile.name}`
                    : `Catálogo completo com ${filteredCatalog.length} títulos disponíveis`}
                </p>
              </div>

              {/* Genre Filter Chips */}
              {activeTab !== 'mylist' && (
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
                  {GENRE_CATEGORIES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1 rounded-xs text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        selectedGenre === genre
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#121212] text-gray-300 hover:bg-[#1e1e1e] hover:text-white border border-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid of Movies */}
            {filteredCatalog.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredCatalog.slice(0, visibleCount).map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayMovie}
                      onOpenDetails={setSelectedMovieForModal}
                      isInWatchlist={currentProfile.watchlist.includes(movie.id)}
                      onToggleWatchlist={handleToggleWatchlist}
                      isLiked={currentProfile.likedIds.includes(movie.id)}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </div>

                {filteredCatalog.length > visibleCount && (
                  <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2">
                    <p className="text-xs text-gray-400">
                      Exibindo {Math.min(visibleCount, filteredCatalog.length)} de {filteredCatalog.length} títulos
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 36)}
                        className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-md hover:bg-gray-200 transition cursor-pointer shadow-lg"
                      >
                        Carregar Mais (+36)
                      </button>
                      <button
                        onClick={() => setVisibleCount(filteredCatalog.length)}
                        className="px-4 py-2.5 bg-white/10 text-white font-semibold text-xs tracking-wider rounded-md hover:bg-white/20 transition cursor-pointer border border-white/10"
                      >
                        Mostrar Todos ({filteredCatalog.length})
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 space-y-4">
                <Film className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-base text-gray-400">
                  {activeTab === 'mylist'
                    ? 'Sua lista está vazia. Adicione filmes e séries clicando no ícone (+).'
                    : 'Nenhum título disponível para este filtro.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Home View: Hero + Rows */
          <div className="space-y-6">
            {/* Hero Billboard */}
            <HeroBanner
              movie={heroMovie}
              onPlay={handlePlayMovie}
              onOpenDetails={setSelectedMovieForModal}
              isInWatchlist={currentProfile.watchlist.includes(heroMovie.id)}
              onToggleWatchlist={handleToggleWatchlist}
            />
            {/* Content Rows Container with negative margin overlay */}
            <div className="relative z-20 -mt-12 sm:-mt-20 md:-mt-28 space-y-4 sm:space-y-6">
              {/* Continue Watching Row */}
              {continueWatchingMovies.length > 0 && (
                <MovieRow
                  id="continue-watching"
                  title={`Continuar Assistindo como ${currentProfile.name}`}
                  subtitle="Retome seus filmes e séries de onde parou"
                  movies={continueWatchingMovies.map((cw) => cw.movie)}
                  onPlay={handlePlayMovie}
                  onOpenDetails={setSelectedMovieForModal}
                  watchlistIds={currentProfile.watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  likedIds={currentProfile.likedIds}
                  onToggleLike={handleToggleLike}
                  continueWatchingProgress={continueWatchingProgressMap}
                  useBackdrop={true}
                />
              )}

              {/* Trending Now Row */}
              <MovieRow
                id="trending-now"
                title="Em Alta no FORTflix"
                movies={trendingMovies}
                onPlay={handlePlayMovie}
                onOpenDetails={setSelectedMovieForModal}
                watchlistIds={currentProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                likedIds={currentProfile.likedIds}
                onToggleLike={handleToggleLike}
              />

              {/* Top 10 Row */}
              {!currentProfile.isKids && (
                <Top10Row
                  title="Top 10 Filmes e Séries no Brasil Hoje"
                  movies={baseMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetails={setSelectedMovieForModal}
                  watchlistIds={currentProfile.watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}

              {/* Originals Row */}
              {netflixOriginals.length > 0 && (
                <MovieRow
                  id="originals"
                  title="Originais FORTflix & Aclamados"
                  subtitle="Produções exclusivas e aclamadas"
                  movies={netflixOriginals}
                  onPlay={handlePlayMovie}
                  onOpenDetails={setSelectedMovieForModal}
                  watchlistIds={currentProfile.watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  likedIds={currentProfile.likedIds}
                  onToggleLike={handleToggleLike}
                />
              )}

              {/* Series Row */}
              <MovieRow
                id="series-row"
                title="Séries Viciantes para Maratonar"
                movies={seriesList}
                onPlay={handlePlayMovie}
                onOpenDetails={setSelectedMovieForModal}
                watchlistIds={currentProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                likedIds={currentProfile.likedIds}
                onToggleLike={handleToggleLike}
              />

              {/* Action & Sci-Fi Rows */}
              {!currentProfile.isKids && (
                <>
                  <MovieRow
                    id="action-row"
                    title="Ação de Tirar o Fôlego"
                    movies={actionMovies}
                    onPlay={handlePlayMovie}
                    onOpenDetails={setSelectedMovieForModal}
                    watchlistIds={currentProfile.watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    likedIds={currentProfile.likedIds}
                    onToggleLike={handleToggleLike}
                  />

                  <MovieRow
                    id="scifi-row"
                    title="Ficção Científica e Outros Mundos"
                    movies={sciFiMovies}
                    onPlay={handlePlayMovie}
                    onOpenDetails={setSelectedMovieForModal}
                    watchlistIds={currentProfile.watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    likedIds={currentProfile.likedIds}
                    onToggleLike={handleToggleLike}
                  />
                </>
              )}

              {/* Animation & Family Row */}
              <MovieRow
                id="animation-row"
                title="Animações & Diversão para Toda a Família"
                movies={animationMovies}
                onPlay={handlePlayMovie}
                onOpenDetails={setSelectedMovieForModal}
                watchlistIds={currentProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                likedIds={currentProfile.likedIds}
                onToggleLike={handleToggleLike}
              />
            </div>
            <AdSenseSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_HOME} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="fortflix-footer" className="bg-[#050505] border-t border-white/10 py-12 px-4 sm:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center tracking-tighter">
                <span className="text-xl font-black text-[#E50914]">FORT</span>
                <span className="text-xl font-black text-white">FLIX</span>
              </div>
              <p className="text-gray-400">
                Plataforma com layout Netflix, integração EmbedMovies API e Bloqueador de Anúncios AdShield.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAdBlockModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>AdShield Pro ({adBlockStats.blockedPopups + adBlockStats.blockedRedirects + adBlockStats.blockedBanners} bloqueados)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-gray-400 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <p className="hover:underline cursor-pointer">Perguntas Frequentes</p>
              <p className="hover:underline cursor-pointer">Central de Ajuda</p>
              <p className="hover:underline cursor-pointer">Termos de Uso</p>
            </div>
            <div className="space-y-2">
              <p className="hover:underline cursor-pointer">Privacidade & Cookies</p>
              <p className="hover:underline cursor-pointer">Servidor EmbedMovies</p>
              <p className="hover:underline cursor-pointer">Informações Corporativas</p>
            </div>
            <div className="space-y-2">
              <p className="hover:underline cursor-pointer">Velocidade de Transmissão</p>
              <p className="hover:underline cursor-pointer">Avisos Legais</p>
              <p className="hover:underline cursor-pointer">Modo Kids</p>
            </div>
            <div className="space-y-2">
              <p className="hover:underline cursor-pointer">Gerenciamento de Perfis</p>
              <p className="hover:underline cursor-pointer">Catálogo TMDb</p>
              <p className="text-emerald-400 font-medium">Status do AdBlock: Ativo</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-600">
            © 2026 FORTflix. Todos os direitos reservados. Vídeos integrados via EmbedMovies.org e reprodutores de streaming externos em ambiente seguro.
          </p>
        </div>
      </footer>

      {/* Movie Details Modal */}
      {selectedMovieForModal && (
        <MovieModal
          movie={selectedMovieForModal}
          onClose={() => setSelectedMovieForModal(null)}
          onPlay={handlePlayMovie}
          isInWatchlist={currentProfile.watchlist.includes(selectedMovieForModal.id)}
          onToggleWatchlist={handleToggleWatchlist}
          isLiked={currentProfile.likedIds.includes(selectedMovieForModal.id)}
          onToggleLike={handleToggleLike}
          allMovies={baseMovies}
          isUnlocked={(currentProfile.unlockedMovieIds || []).includes(selectedMovieForModal.id)}
        />
      )}

      {isCreditWalletOpen && (
        <CreditWalletModal
          balance={currentProfile.credits || 0}
          history={currentProfile.creditHistory || []}
          onClose={() => setIsCreditWalletOpen(false)}
          onRewardGranted={handleRewardGranted}
          onWatchAd={handleWatchRewardedAd}
        />
      )}

      {/* Fullscreen EmbedMovies Video Player */}
      {playingMovie && (
        <VideoPlayer
          movie={playingMovie.movie}
          seasonNumber={playingMovie.season}
          episodeNumber={playingMovie.episode}
          onClose={() => setPlayingMovie(null)}
          onSelectEpisode={(season, episode) => {
            setPlayingMovie((prev) => (prev ? { ...prev, season, episode } : null));
          }}
          adBlockStats={adBlockStats}
          onToggleAdShield={() => adBlocker.toggleShield()}
        />
      )}

      {/* Profile Selector Screen */}
      {isProfileSelectorOpen && (
        <ProfileSelector
          profiles={profiles}
          currentProfileId={currentProfileId}
          onSelectProfile={handleSelectProfile}
          onAddProfile={handleAddProfile}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setIsProfileSelectorOpen(false)}
        />
      )}

      {/* AdBlocker Control & Status Modal */}
      {isAdBlockModalOpen && (
        <AdBlockerStatusModal
          stats={adBlockStats}
          onClose={() => setIsAdBlockModalOpen(false)}
          onToggleShield={() => adBlocker.toggleShield()}
        />
      )}
    </div>
  );
}
