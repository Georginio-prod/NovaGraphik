import { createClient } from '@supabase/supabase-js'

// Supabase project configuration (set in .env)
//   VITE_SUPABASE_URL       — https://<ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY  — public anon key (JWT)
const url = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

export const isSupabaseConfigured = !!url && !!anonKey

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant — l’authentification est désactivée jusqu’à la configuration de .env.',
  )
}

// `createClient` throws on an invalid URL, so when env is missing we fall back
// to a dummy URL just to construct the client. Runtime calls (login, etc.)
// will still fail until the real values are set, but the SPA can boot.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
)
