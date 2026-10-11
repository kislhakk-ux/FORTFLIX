/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_HOME?: string;
  readonly VITE_ADSENSE_SLOT_CATALOG?: string;
  readonly VITE_GAM_REWARDED_AD_UNIT_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
