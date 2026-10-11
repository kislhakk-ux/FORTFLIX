import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, ShieldCheck, ChevronDown, Check, Plus, Film, User, Edit3, Trash2, ShieldAlert, Coins } from 'lucide-react';
import { UserProfile, AdBlockStats } from '../types';

interface NavbarProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenManageProfiles: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  creditBalance: number;
  onOpenCreditWallet: () => void;
  adBlockStats: AdBlockStats;
  onToggleAdShield: () => void;
  onOpenAdShieldModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  onOpenManageProfiles,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  creditBalance,
  onOpenCreditWallet,
  adBlockStats,
  onToggleAdShield,
  onOpenAdShieldModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalBlocked = adBlockStats.blockedPopups + adBlockStats.blockedRedirects + adBlockStats.blockedBanners;

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/95 backdrop-blur-xl shadow-2xl border-b border-white/5 py-4'
          : 'bg-gradient-to-b from-[#050505]/90 via-[#050505]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center space-x-8 md:space-x-10">
          {/* Logo */}
          <button
            id="nav-brand-logo"
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-2 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center tracking-tighter">
              <span className="text-2xl md:text-3xl font-black text-[#E50914] group-hover:opacity-90 transition-opacity">
                FORT
              </span>
              <span className="text-2xl md:text-3xl font-black text-white group-hover:text-gray-200 transition-colors">
                FLIX
              </span>
            </div>
            <span className="px-2 py-0.5 border border-white/20 rounded-full text-[9px] uppercase tracking-widest text-gray-300 font-semibold hidden sm:inline-block bg-white/5">
              HD / 4K
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium tracking-wide uppercase text-gray-300">
            <button
              id="nav-tab-home"
              onClick={() => onSelectTab('home')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'home' ? 'text-white font-bold tracking-wider' : 'text-gray-400 hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              id="nav-tab-series"
              onClick={() => onSelectTab('series')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'series' ? 'text-white font-bold tracking-wider' : 'text-gray-400 hover:text-white'
              }`}
            >
              Séries
            </button>
            <button
              id="nav-tab-movies"
              onClick={() => onSelectTab('movies')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'movies' ? 'text-white font-bold tracking-wider' : 'text-gray-400 hover:text-white'
              }`}
            >
              Filmes
            </button>
            <button
              id="nav-tab-trending"
              onClick={() => onSelectTab('trending')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'trending' ? 'text-white font-bold tracking-wider' : 'text-gray-400 hover:text-white'
              }`}
            >
              Bombando
            </button>
            <button
              id="nav-tab-mylist"
              onClick={() => onSelectTab('mylist')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'mylist' ? 'text-white font-bold tracking-wider' : 'text-gray-400 hover:text-white'
              }`}
            >
              Minha Lista
            </button>
          </nav>
        </div>

        {/* Right: Actions, AdShield, Search, Notifications & Profile */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <button
            id="nav-credits-button"
            type="button"
            onClick={onOpenCreditWallet}
            className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1.5 text-sm font-bold text-amber-200 transition hover:bg-amber-300/20"
            title="Abrir carteira de créditos"
            aria-label={'Carteira: ' + creditBalance + ' créditos'}
          >
            <Coins className="h-4 w-4" />
            <span className="tabular-nums">{creditBalance}</span>
          </button>

          {/* AdShield Pro Indicator */}
          <button
            id="nav-adshield-button"
            onClick={onOpenAdShieldModal}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all border cursor-pointer ${
              adBlockStats.shieldActive
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/40'
            }`}
            title="Clique para ver o Bloqueador de Anúncios CineStream"
          >
            {adBlockStats.shieldActive ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="hidden lg:inline">
              {adBlockStats.shieldActive ? 'AdShield Ativo' : 'AdShield Desativado'}
            </span>
            {totalBlocked > 0 && (
              <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {totalBlocked}
              </span>
            )}
          </button>

          {/* Search Bar */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#0d0d0d] border border-white/20 rounded-md px-3 py-1.5 transition-all duration-300 w-44 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  id="nav-search-input"
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
                />
                <button
                  id="nav-search-close"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-gray-400 hover:text-white text-xs ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                id="nav-search-open-btn"
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
                title="Pesquisar filmes e séries"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E50914] rounded-full" />
            </button>

            {isNotificationsOpen && (
              <div
                id="nav-notifications-menu"
                className="absolute right-0 mt-3 w-80 bg-[#0d0d0d] border border-white/10 rounded-md shadow-2xl p-4 z-50 animate-fadeIn"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Notificações</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Recentes</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3 p-2 rounded bg-white/5 hover:bg-white/10 transition">
                    <img
                      src="https://image.tmdb.org/t/p/w200/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"
                      alt="Deadpool"
                      className="w-10 h-14 object-cover rounded-xs"
                    />
                    <div>
                      <p className="font-bold text-white">Deadpool & Wolverine</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">Disponível em 4K Ultra HD sem anúncios.</p>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Novo lançamento</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-2 rounded hover:bg-white/5 transition">
                    <img
                      src="https://image.tmdb.org/t/p/w200/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"
                      alt="Stranger Things"
                      className="w-10 h-14 object-cover rounded-xs"
                    />
                    <div>
                      <p className="font-bold text-white">Stranger Things</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">Continue de onde parou na Temporada 4.</p>
                      <span className="text-[10px] text-gray-500">Há 2 horas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="nav-profile-menu-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md overflow-hidden border border-white/20 group-hover:border-white transition">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div
                id="nav-profile-dropdown"
                className="absolute right-0 mt-3 w-56 bg-[#0d0d0d] border border-white/10 rounded-md shadow-2xl py-2 z-50 animate-fadeIn text-xs"
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Trocar Perfil</p>
                  <div className="mt-2 space-y-1">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        id={`profile-switch-${p.id}`}
                        onClick={() => {
                          onSelectProfile(p);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded transition cursor-pointer ${
                          p.id === currentProfile.id ? 'bg-white/10 font-bold text-white' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-xs object-cover" />
                          <span className="text-xs">{p.name}</span>
                          {p.isKids && (
                            <span className="text-[9px] bg-blue-600/30 text-blue-400 px-1 py-0.2 rounded border border-blue-500/30">
                              Kids
                            </span>
                          )}
                        </div>
                        {p.id === currentProfile.id && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="nav-manage-profiles-btn"
                    onClick={() => {
                      onOpenManageProfiles();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Gerenciar Perfis</span>
                  </button>

                  <button
                    id="nav-adshield-settings-btn"
                    onClick={() => {
                      onOpenAdShieldModal();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-emerald-400 hover:bg-white/5 transition cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Painel do Bloqueador</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
