import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Zap, Layers, Lock, Ban, PlayCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AdBlockStats } from '../types';
import { adBlocker } from '../services/adBlocker';

interface AdBlockerStatusModalProps {
  stats: AdBlockStats;
  onClose: () => void;
  onToggleShield: () => void;
}

export const AdBlockerStatusModal: React.FC<AdBlockerStatusModalProps> = ({
  stats,
  onClose,
  onToggleShield,
}) => {
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleTestBlocker = () => {
    // Attempt a simulated popup through window.open to trigger the blocker
    try {
      window.open('https://adsterra-popunder-test.com/tracker', '_blank');
      setTestNotification('Pop-up malicioso interceptado e neutralizado com sucesso pelo FORTflix AdShield!');
      setTimeout(() => setTestNotification(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    adBlocker.resetStats();
  };

  const totalBlocked = stats.blockedPopups + stats.blockedRedirects + stats.blockedBanners;

  return (
    <div
      id="adblock-status-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="adblock-status-modal-content"
        className="relative w-full max-w-xl bg-[#090909] rounded-sm border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-md ${stats.shieldActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              {stats.shieldActive ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">FORTflix AdShield Pro</h2>
              <p className="text-xs text-gray-400">Script de Bloqueio Ativo & Proteção de Streaming</p>
            </div>
          </div>

          <button
            id="adblock-modal-close-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Notification Banner */}
        {testNotification && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-md flex items-center space-x-2 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testNotification}</span>
          </div>
        )}

        {/* Status Toggle & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0d0d0d] p-3.5 rounded-sm border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Popups Bloqueados</span>
              <Ban className="w-4 h-4 text-[#E50914]" />
            </div>
            <span className="text-2xl font-black text-white mt-2">{stats.blockedPopups}</span>
          </div>

          <div className="bg-[#0d0d0d] p-3.5 rounded-sm border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Redirecionamentos</span>
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-black text-white mt-2">{stats.blockedRedirects}</span>
          </div>

          <div className="bg-[#0d0d0d] p-3.5 rounded-sm border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Banners Removidos</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-white mt-2">{stats.blockedBanners}</span>
          </div>
        </div>

        {/* Protection Layers Description */}
        <div className="space-y-3 bg-[#0d0d0d] p-4 rounded-sm border border-white/5 text-xs">
          <p className="font-bold text-gray-200 uppercase tracking-widest text-[10px]">
            Como funciona o bloqueador no código:
          </p>

          <div className="space-y-2.5 text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <p>
                <strong className="text-white">Sandbox Estrita no Iframe:</strong> Isola o player de filmes do EmbedMovies sem permissão de abrir abas ou redirecionar a página.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <p>
                <strong className="text-white">Interceptor de `window.open`:</strong> Sobrescreve as chamadas de abertura de janelas bloqueando redes conhecidas de anúncios (PopCash, Adsterra, Propeller, etc).
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <p>
                <strong className="text-white">Filtro de Click-Jacking:</strong> Destrói camadas invisíveis transparentes que tentam forçar o usuário a clicar em propagandas antes do vídeo dar play.
              </p>
            </div>
          </div>
        </div>

        {/* Controls and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              id="adblock-toggle-action-btn"
              onClick={onToggleShield}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-2 ${
                stats.shieldActive
                  ? 'bg-rose-600/90 hover:bg-rose-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{stats.shieldActive ? 'Pausar AdShield' : 'Ativar AdShield'}</span>
            </button>

            <button
              id="adblock-test-btn"
              onClick={handleTestBlocker}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-md transition cursor-pointer border border-white/10"
              title="Testa o script tentando abrir um anúncio falso"
            >
              Testar Bloqueio
            </button>
          </div>

          <button
            id="adblock-reset-stats-btn"
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Zerar Contadores</span>
          </button>
        </div>
      </div>
    </div>
  );
};
