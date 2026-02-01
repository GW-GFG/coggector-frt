/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly INITIAL_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
