/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOMENTS_SYNC_SECRET?: string
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
