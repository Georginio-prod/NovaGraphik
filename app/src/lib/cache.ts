// Tiny localStorage-backed cache for public CMS data.
//
// The site reads from a remote Supabase project where each query costs ~400ms
// of network round-trip. To avoid a blank/slow first paint on every navigation,
// loaders hydrate their refs synchronously from the last cached payload, render
// instantly, then revalidate in the background and overwrite the cache. This is
// a classic stale-while-revalidate strategy.

const PREFIX = 'nova:cache:'

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full / unavailable (private mode) — caching is best-effort
  }
}

export function invalidateCache(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // noop
  }
}
