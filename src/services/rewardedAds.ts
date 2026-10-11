export type RewardedOutcome = 'granted' | 'unavailable' | 'closed' | 'unconfigured';

type GptSlot = {
  addService(service: unknown): GptSlot;
};

type GptEvent = {
  slot: GptSlot;
  isEmpty?: boolean;
  makeRewardedVisible?: () => boolean;
};

type GptPubAds = {
  addEventListener(name: string, listener: (event: GptEvent) => void): void;
  removeEventListener(name: string, listener: (event: GptEvent) => void): void;
};

type GptApi = {
  apiReady?: boolean;
  cmd: Array<() => void>;
  enums: { OutOfPageFormat: { REWARDED: string } };
  defineOutOfPageSlot(unit: string, format: string): GptSlot | null;
  pubads(): GptPubAds;
  enableServices(): void;
  display(slot: GptSlot): void;
  destroySlots(slots: GptSlot[]): boolean;
};

declare global {
  interface Window {
    googletag?: GptApi;
  }
}

const rewardedUnitPath = import.meta.env.VITE_GAM_REWARDED_AD_UNIT_PATH?.trim();
let gptLoadPromise: Promise<GptApi> | null = null;
let gptServicesEnabled = false;

function loadGooglePublisherTag(): Promise<GptApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Anúncios só podem ser carregados no navegador.'));
  }
  if (window.googletag?.apiReady) return Promise.resolve(window.googletag);
  if (gptLoadPromise) return gptLoadPromise;

  window.googletag = window.googletag || { cmd: [] } as GptApi;
  gptLoadPromise = new Promise<GptApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    script.dataset.fortflixGpt = 'true';
    script.onerror = () => {
      gptLoadPromise = null;
      reject(new Error('Não foi possível carregar o Google Publisher Tag.'));
    };
    document.head.appendChild(script);

    const timeout = window.setTimeout(() => {
      gptLoadPromise = null;
      reject(new Error('O Google Publisher Tag demorou para responder.'));
    }, 15000);
    window.googletag!.cmd.push(() => {
      window.clearTimeout(timeout);
      resolve(window.googletag!);
    });
  });
  return gptLoadPromise;
}

/**
 * Requests a real Google Ad Manager rewarded-web ad. No reward is granted
 * here: the caller must add credits only after this resolves as "granted".
 */
export async function requestRewardedAd(): Promise<RewardedOutcome> {
  if (!rewardedUnitPath) return 'unconfigured';

  let gpt: GptApi;
  try {
    gpt = await loadGooglePublisherTag();
  } catch {
    return 'unavailable';
  }

  return new Promise<RewardedOutcome>((resolve) => {
    gpt.cmd.push(() => {
      const slot = gpt.defineOutOfPageSlot(
        rewardedUnitPath,
        gpt.enums.OutOfPageFormat.REWARDED,
      );
      if (!slot) {
        resolve('unavailable');
        return;
      }

      const pubads = gpt.pubads();
      let settled = false;
      let granted = false;
      let timeoutId = 0;

      const destroy = () => {
        window.clearTimeout(timeoutId);
        pubads.removeEventListener('rewardedSlotReady', onReady);
        pubads.removeEventListener('rewardedSlotGranted', onGranted);
        pubads.removeEventListener('rewardedSlotClosed', onClosed);
        pubads.removeEventListener('slotRenderEnded', onRendered);
        gpt.destroySlots([slot]);
      };

      const finish = (outcome: RewardedOutcome) => {
        if (settled) return;
        settled = true;
        if (outcome !== 'granted') destroy();
        resolve(outcome);
      };

      const onReady = (event: GptEvent) => {
        if (event.slot !== slot) return;
        if (!event.makeRewardedVisible || !event.makeRewardedVisible()) {
          finish('unavailable');
        }
      };
      const onGranted = (event: GptEvent) => {
        if (event.slot !== slot) return;
        granted = true;
        window.clearTimeout(timeoutId);
        finish('granted');
      };
      const onClosed = (event: GptEvent) => {
        if (event.slot !== slot) return;
        if (!granted) finish('closed');
        else destroy();
      };
      const onRendered = (event: GptEvent) => {
        if (event.slot === slot && event.isEmpty) finish('unavailable');
      };

      pubads.addEventListener('rewardedSlotReady', onReady);
      pubads.addEventListener('rewardedSlotGranted', onGranted);
      pubads.addEventListener('rewardedSlotClosed', onClosed);
      pubads.addEventListener('slotRenderEnded', onRendered);

      timeoutId = window.setTimeout(() => finish('unavailable'), 20000);
      slot.addService(pubads);
      if (!gptServicesEnabled) {
        gpt.enableServices();
        gptServicesEnabled = true;
      }
      gpt.display(slot);
    });
  });
}

export function isRewardedAdsConfigured(): boolean {
  return Boolean(rewardedUnitPath);
}
