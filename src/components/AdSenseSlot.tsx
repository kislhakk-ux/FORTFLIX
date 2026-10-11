import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSenseSlotProps {
  slotId?: string;
  className?: string;
}

const publisherId = import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim();

/** Displays a regular AdSense placement only when the real publisher values exist. */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({ slotId, className = '' }) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!publisherId || !slotId || !adRef.current) return;
    if (adRef.current.dataset.adRequested === 'true') return;
    adRef.current.dataset.adRequested = 'true';

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-fortflix-adsense="true"]',
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.fortflixAdsense = 'true';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
        + encodeURIComponent(publisherId);
      document.head.appendChild(script);
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.error('Não foi possível solicitar este espaço do AdSense.', error);
    }
  }, [slotId]);

  if (!publisherId || !slotId) return null;

  return (
    <div className={'mx-auto my-8 w-full max-w-6xl px-4 ' + className}>
      <ins
        ref={adRef}
        className="adsbygoogle block min-h-[90px] w-full overflow-hidden"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
