import React, { useState } from 'react';
import { Coins, X, CircleHelp, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { REWARDED_AD_CREDITS } from '../utils/credits';
import { CreditHistoryEntry } from '../types';
import { isRewardedAdsConfigured, RewardedOutcome } from '../services/rewardedAds';

interface CreditWalletModalProps {
  balance: number;
  history: CreditHistoryEntry[];
  onClose: () => void;
  onRewardGranted: (amount: number) => void;
  onWatchAd: () => Promise<RewardedOutcome>;
}

export const CreditWalletModal: React.FC<CreditWalletModalProps> = ({
  balance,
  history,
  onClose,
  onRewardGranted,
  onWatchAd,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const isAdConfigured = isRewardedAdsConfigured();

  const handleWatchAd = async () => {
    setIsLoading(true);
    setMessage(null);
    let result: RewardedOutcome;
    try {
      result = await onWatchAd();
    } catch {
      setIsLoading(false);
      setMessage({
        kind: 'error',
        text: 'O anúncio não pôde ser carregado. Nenhum crédito foi adicionado.',
      });
      return;
    }
    setIsLoading(false);

    if (result === 'granted') {
      onRewardGranted(REWARDED_AD_CREDITS);
      setMessage({ kind: 'success', text: 'Anúncio concluído. 50 créditos adicionados ao perfil.' });
      return;
    }
    if (result === 'unconfigured') {
      setMessage({
        kind: 'error',
        text: 'A unidade de anúncio recompensado ainda não foi configurada. Nenhum crédito foi adicionado.',
      });
      return;
    }
    if (result === 'closed') {
      setMessage({ kind: 'error', text: 'O anúncio foi fechado antes de liberar a recompensa.' });
      return;
    }
    setMessage({
      kind: 'error',
      text: 'Não há anúncio disponível agora. Tente novamente mais tarde. Nenhum crédito foi adicionado.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-wallet-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E50914]">FORTFLIX</p>
            <h2 id="credit-wallet-title" className="mt-2 text-2xl font-black">Minha carteira</h2>
          </div>
          <button
            type="button"
            aria-label="Fechar carteira"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg border border-[#E50914]/30 bg-[#E50914]/10 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400">Saldo deste perfil</p>
          <div className="mt-2 flex items-center gap-3">
            <Coins className="h-8 w-8 text-amber-300" />
            <span className="text-4xl font-black tabular-nums">{balance}</span>
            <span className="pt-3 text-sm text-gray-400">créditos</span>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="font-bold">Ganhe 50 créditos assistindo a um anúncio</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            A recompensa só entra no saldo quando o evento do Google Ad Manager indicar que foi liberada.
            Fechar antes ou não receber um anúncio não adiciona créditos.
          </p>
          {!isAdConfigured && (
            <p className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs leading-relaxed text-amber-100">
              Anúncios ainda não configurados. Nenhuma recompensa será liberada até conectar sua unidade real do Google Ad Manager.
            </p>
          )}
          <button
            type="button"
            onClick={handleWatchAd}
            disabled={isLoading || !isAdConfigured}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#E50914] px-4 py-3 text-sm font-extrabold transition hover:bg-[#bf0710] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Buscando anúncio...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4" />
                {isAdConfigured ? 'Assistir anúncio e receber 50' : 'Anúncio não configurado'}
              </>
            )}
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Movimentações recentes</h3>
          {history.length > 0 ? (
            <ul className="mt-2 divide-y divide-white/5">
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                  <span className="min-w-0 truncate text-gray-300">{entry.description}</span>
                  <span className={entry.amount > 0 ? 'shrink-0 font-bold text-emerald-300' : 'shrink-0 font-bold text-gray-300'}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Nenhuma movimentação neste perfil.</p>
          )}
        </div>

        {message && (
          <div
            role="status"
            className={
              'mt-4 flex items-start gap-2 rounded-md border p-3 text-sm ' +
              (message.kind === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-100')
            }
          >
            {message.kind === 'success'
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-gray-500">
          <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Filmes custam 27 créditos; lançamentos marcados como novos custam 33. Os créditos não têm valor em dinheiro.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-gray-600">
          O saldo desta versão fica salvo neste navegador e ainda não sincroniza com uma conta ou servidor.
        </p>
      </section>
    </div>
  );
};
