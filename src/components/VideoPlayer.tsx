import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Server, ShieldCheck, ShieldAlert, RefreshCw, Maximize2, SkipForward, SkipBack, Settings, Info, Film, Tv } from 'lucide-react';
import { Movie, PlayerServer, AdBlockStats } from '../types';
import { PLAYER_SERVERS } from '../data/movies';
import { adBlocker } from '../services/adBlocker';

interface VideoPlayerProps {
  movie: Movie;
  seasonNumber?: number;
  episodeNumber?: number;
  onClose: () => void;
  onSelectEpisode?: (season: number, episode: number) => void;
  adBlockStats: AdBlockStats;
  onToggleAdShield: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  seasonNumber = 1,
  episodeNumber = 1,
  onClose,
  onSelectEpisode,
  adBlockStats,
  onToggleAdShield,
}) => {
  const [currentServer, setCurrentServer] = useState<PlayerServer>(PLAYER_SERVERS[0]);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
  const [useStrictSandbox, setUseStrictSandbox] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(true);
  const [customTmdbInput, setCustomTmdbInput] = useState('');
  const [activeTmdbId, setActiveTmdbId] = useState(movie.tmdbId);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setActiveTmdbId(movie.tmdbId);
  }, [movie]);

  const playerUrl = currentServer.getUrl(
    activeTmdbId,
    movie.type,
    seasonNumber,
    episodeNumber,
    movie.imdbId
  );

  const reloadPlayer = () => {
    setPlayerKey((prev) => prev + 1);
  };

  const handleNextEpisode = () => {
    if (!onSelectEpisode || !movie.seasons) return;
    const currentSeasonObj = movie.seasons.find((s) => s.seasonNumber === seasonNumber);
    if (!currentSeasonObj) return;

    if (episodeNumber < currentSeasonObj.episodesCount) {
      onSelectEpisode(seasonNumber, episodeNumber + 1);
    } else {
      const nextSeason = movie.seasons.find((s) => s.seasonNumber === seasonNumber + 1);
      if (nextSeason) {
        onSelectEpisode(seasonNumber + 1, 1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (!onSelectEpisode || episodeNumber <= 1) return;
    onSelectEpisode(seasonNumber, episodeNumber - 1);
  };

  const currentSeasonObj = movie.seasons?.find((s) => s.seasonNumber === seasonNumber);

  return (
    <div
      id="video-player-container"
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col text-white animate-fadeIn select-none"
    >
      {/* Top Player Controls Bar */}
      <header
        id="player-header-bar"
        className="h-16 px-4 sm:px-6 bg-[#050505] border-b border-white/10 flex items-center justify-between z-30"
      >
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            id="player-back-button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer flex items-center space-x-1.5 border border-white/10"
            title="Voltar ao catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Voltar</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black text-[#E50914] bg-[#E50914]/10 px-1.5 py-0.2 rounded-xs border border-[#E50914]/30">
                {movie.type === 'tv' ? 'Série' : 'Filme'}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md uppercase tracking-tight">
                {movie.title}
              </h1>
            </div>
            {movie.type === 'tv' && (
              <p className="text-[11px] text-gray-400">
                Temporada {seasonNumber} • Episódio {episodeNumber}
              </p>
            )}
          </div>
        </div>

        {/* Right: Server switcher, Episode switcher, AdShield status, and Reload */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AdBlocker Live Status Badge */}
          <button
            id="player-adshield-toggle"
            onClick={onToggleAdShield}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition cursor-pointer ${
              adBlockStats.shieldActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
            title="Clique para ativar/desativar o script de bloqueio de anúncios"
          >
            {adBlockStats.shieldActive ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="hidden sm:inline">
              {adBlockStats.shieldActive ? 'AdShield Ativo' : 'AdShield Desligado'}
            </span>
            <span className="bg-black/50 px-1.5 py-0.2 rounded-xs text-[10px]">
              {adBlockStats.blockedPopups + adBlockStats.blockedRedirects + adBlockStats.blockedBanners} bloqueados
            </span>
          </button>

          {/* Episode Switcher for Series */}
          {movie.type === 'tv' && movie.seasons && (
            <div className="relative">
              <button
                id="player-episodes-menu-btn"
                onClick={() => setIsSeasonMenuOpen(!isSeasonMenuOpen)}
                className="flex items-center space-x-1.5 bg-[#121212] hover:bg-[#1f1f1f] border border-white/10 text-xs font-semibold px-2.5 py-1.5 rounded-md transition cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-[#E50914]" />
                <span className="hidden md:inline">T{seasonNumber}:E{episodeNumber}</span>
                <span className="md:hidden">Episódios</span>
              </button>

              {isSeasonMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-sm shadow-2xl p-2 z-50 animate-fadeIn">
                  <p className="text-xs font-bold text-gray-300 px-2 py-1 mb-1 border-b border-white/10 uppercase tracking-wider">
                    Selecione o Episódio
                  </p>
                  <div className="space-y-1">
                    {currentSeasonObj?.episodes.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => {
                          if (onSelectEpisode) onSelectEpisode(ep.seasonNumber, ep.episodeNumber);
                          setIsSeasonMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xs text-xs transition flex items-center justify-between ${
                          ep.episodeNumber === episodeNumber
                            ? 'bg-[#E50914] text-white font-bold'
                            : 'text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">Ep {ep.episodeNumber}: {ep.title}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{ep.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Server Switcher Dropdown */}
          <div className="relative">
            <button
              id="player-server-selector-btn"
              onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
              className="flex items-center space-x-1.5 bg-[#121212] hover:bg-[#1f1f1f] border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-md transition cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{currentServer.name}</span>
              <span className="sm:hidden">Servidor</span>
            </button>

            {isServerMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d0d0d] border border-white/10 rounded-sm shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Servidores</p>
                  <p className="text-[10px] text-gray-400">Troque se o player travar ou demorar a carregar</p>
                </div>
                <div className="space-y-1">
                  {PLAYER_SERVERS.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => {
                        setCurrentServer(server);
                        setIsServerMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xs text-xs transition flex items-center justify-between ${
                        server.id === currentServer.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{server.name}</p>
                        <span className="text-[10px] opacity-80">{server.speed} • {server.quality}</span>
                      </div>
                      <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-mono">
                        {server.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reload Player Button */}
          <button
            id="player-reload-btn"
            onClick={reloadPlayer}
            className="p-2 rounded-md bg-[#121212] hover:bg-[#1f1f1f] border border-white/10 text-gray-300 hover:text-white transition cursor-pointer"
            title="Recarregar player sem anúncios"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Iframe Player Viewport */}
      <main className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* Sandboxed EmbedMovies Player Iframe */}
        <iframe
          key={`${currentServer.id}-${activeTmdbId}-${seasonNumber}-${episodeNumber}-${playerKey}`}
          ref={iframeRef}
          src={playerUrl}
          title={`${movie.title} Player`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          sandbox={
            useStrictSandbox
              ? 'allow-scripts allow-same-origin allow-forms allow-presentation allow-encrypted-media'
              : 'allow-scripts allow-same-origin allow-forms allow-presentation allow-encrypted-media allow-popups'
          }
        />

        {/* Ambient Overlay Vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />
      </main>

      {/* Bottom Player Footer Bar */}
      <footer
        id="player-footer-bar"
        className="h-14 px-4 sm:px-6 bg-[#050505] border-t border-white/10 flex items-center justify-between text-xs text-gray-400"
      >
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Transmissão Segura EmbedMovies</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">TMDB ID: {activeTmdbId}</span>
          <span className="hidden md:inline">• Qualidade: {currentServer.quality}</span>
        </div>

        {/* Series Next / Prev Navigation */}
        <div className="flex items-center space-x-2">
          {movie.type === 'tv' && (
            <>
              <button
                id="player-prev-ep-btn"
                onClick={handlePrevEpisode}
                disabled={episodeNumber <= 1}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#141414] hover:bg-[#202020] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer border border-white/10"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ep. Anterior</span>
              </button>

              <button
                id="player-next-ep-btn"
                onClick={handleNextEpisode}
                className="flex items-center space-x-1 px-3 py-1 rounded-md bg-[#E50914] hover:bg-[#b80710] text-white font-bold transition cursor-pointer"
              >
                <span>Próximo Ep.</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Sandbox Toggle for rare edge cases */}
          <button
            id="player-sandbox-toggle"
            onClick={() => setUseStrictSandbox(!useStrictSandbox)}
            className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 transition"
            title="Alterne caso algum servidor exija permissão especial para iniciar o player"
          >
            Modo Sandbox: {useStrictSandbox ? 'Estrito (Anti-Popups)' : 'Flexível'}
          </button>
        </div>
      </footer>
    </div>
  );
};
