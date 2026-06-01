import { ref, computed } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Module-level singleton state, kept in sync with the Supabase session.
const session = ref<Session | null>(null)
const user = ref<User | null>(null)
const ready = ref(false)

let initPromise: Promise<void> | null = null

async function init() {
  const { data } = await supabase.auth.getSession()
  session.value = data.session
  user.value = data.session?.user ?? null
  ready.value = true
}

function startInit() {
  if (initPromise) return initPromise
  initPromise = init().catch(() => {
    ready.value = true
  })
  // React to subsequent auth changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s
    user.value = s?.user ?? null
    ready.value = true
  })
  return initPromise
}

// Kick off initialisation immediately on module load.
startInit()

export function useAuth() {
  // With a single shared credential, any authenticated user is an admin.
  const isAuthenticated = computed(() => !!session.value)
  const isAdmin = computed(() => !!user.value)

  async function login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    session.value = data.session
    user.value = data.user
    return data.user
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
  }

  // Awaitable across navigation guards — resolves once Supabase has loaded the session.
  async function ensureSession(): Promise<User | null> {
    if (!ready.value) await startInit()
    return user.value
  }

  return { session, user, ready, isAdmin, isAuthenticated, login, logout, ensureSession }
}
