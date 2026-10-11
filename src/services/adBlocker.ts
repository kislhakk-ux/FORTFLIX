import { AdBlockStats } from '../types';

class AdBlockerEngine {
  private stats: AdBlockStats = {
    blockedPopups: 0,
    blockedRedirects: 0,
    blockedBanners: 0,
    shieldActive: true,
  };

  private listeners: ((stats: AdBlockStats) => void)[] = [];
  private isInitialized = false;

  private adDomains = [
    'adsterra', 'popcash', 'propellerads', 'doubleclick', 'adnxs',
    'exoclick', 'clickadu', 'trafficjunky', 'bet365', '1xbet',
    'popads', 'yllix', 'juicyads', 'adbuffs', 'onclickads',
    'adx', 'track', 'affiliate', 'monetag', 'hilltopads',
    'richpush', 'evadav', 'admaven', 'syndication', 'zergnet'
  ];

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    this.patchWindowOpen();
    this.patchNavigation();
    this.setupMutationFilter();
    this.setupClickInterceptor();
  }

  public subscribe(callback: (stats: AdBlockStats) => void) {
    this.listeners.push(callback);
    callback({ ...this.stats });
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getStats(): AdBlockStats {
    return { ...this.stats };
  }

  public toggleShield(active?: boolean): boolean {
    this.stats.shieldActive = active !== undefined ? active : !this.stats.shieldActive;
    this.notify();
    return this.stats.shieldActive;
  }

  public resetStats() {
    this.stats.blockedPopups = 0;
    this.stats.blockedRedirects = 0;
    this.stats.blockedBanners = 0;
    this.notify();
  }

  private notify() {
    const copy = { ...this.stats, lastBlockedAt: new Date().toLocaleTimeString('pt-BR') };
    this.listeners.forEach(cb => cb(copy));
  }

  private patchWindowOpen() {
    const originalOpen = window.open;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__originalOpen = originalOpen;

    window.open = (url?: string | URL, target?: string, features?: string) => {
      if (!this.stats.shieldActive) {
        return originalOpen.call(window, url, target, features);
      }

      const urlStr = String(url || '').toLowerCase();
      // Preserve intentional Google publisher inventory configured by FORTflix.
      if (this.isApprovedGoogleAdUrl(urlStr)) {
        return originalOpen.call(window, url, target, features);
      }
      const isKnownAd = this.adDomains.some(domain => urlStr.includes(domain));

      // If opening an external URL without user intent or known ad network, block it
      if (isKnownAd || !url || urlStr.startsWith('http://') || urlStr.includes('ad') || urlStr.includes('click')) {
        this.stats.blockedPopups++;
        this.notify();
        console.warn(`[AdShield Pro] Bloqueou tentativa de pop-up não autorizada: ${urlStr || 'vazia'}`);
        return null;
      }

      return originalOpen.call(window, url, target, features);
    };
  }

  private patchNavigation() {
    // Intercept rogue location redirects triggered by embedded scripts
    window.addEventListener('beforeunload', (e) => {
      if (this.stats.shieldActive) {
        // Prevent rogue auto-redirects
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'IFRAME') {
          this.stats.blockedRedirects++;
          this.notify();
          e.preventDefault();
          return (e.returnValue = 'Redirecionamento bloqueado pelo CineStream AdShield');
        }
      }
    });
  }

  private setupClickInterceptor() {
    // Catch stealth transparent click-jack overlay clicks
    document.addEventListener('click', (e) => {
      if (!this.stats.shieldActive) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if target is an ad-like overlay
      const className = (target.className && typeof target.className === 'string') ? target.className.toLowerCase() : '';
      const id = (target.id && typeof target.id === 'string') ? target.id.toLowerCase() : '';

      if (
        className.includes('ad-overlay') || 
        className.includes('pop-under') || 
        id.includes('ad-banner') ||
        (target.tagName === 'A' && (target as HTMLAnchorElement).target === '_blank' && this.isSuspiciousUrl((target as HTMLAnchorElement).href))
      ) {
        e.preventDefault();
        e.stopPropagation();
        target.remove();
        this.stats.blockedPopups++;
        this.notify();
        console.warn('[AdShield Pro] Bloqueou clique invasivo e removeu camada de anúncio.');
      }
    }, true);
  }

  private setupMutationFilter() {
    const observer = new MutationObserver((mutations) => {
      if (!this.stats.shieldActive) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            const id = (el.id || '').toLowerCase();
            const cls = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';

            // Detect floating ad overlays or injected trackers
            if (
              (tag === 'div' || tag === 'iframe') &&
              (id.includes('ad-container') || id.includes('banner-ad') || cls.includes('ad-wrapper'))
            ) {
              el.remove();
              this.stats.blockedBanners++;
              this.notify();
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  private isSuspiciousUrl(url: string): boolean {
    const low = url.toLowerCase();
    if (this.isApprovedGoogleAdUrl(low)) return false;
    return this.adDomains.some(d => low.includes(d));
  }

  private isApprovedGoogleAdUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      return hostname === 'doubleclick.net'
        || hostname.endsWith('.doubleclick.net')
        || hostname === 'googlesyndication.com'
        || hostname.endsWith('.googlesyndication.com')
        || hostname === 'googleadservices.com'
        || hostname.endsWith('.googleadservices.com')
        || hostname === 'googletagservices.com'
        || hostname.endsWith('.googletagservices.com')
        || ((hostname === 'google.com' || hostname === 'www.google.com')
          && (parsedUrl.pathname.startsWith('/pagead/') || parsedUrl.pathname.startsWith('/aclk')));
    } catch {
      return false;
    }
  }
}

export const adBlocker = new AdBlockerEngine();
