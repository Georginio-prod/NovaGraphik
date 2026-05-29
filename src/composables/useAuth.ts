import { ref, computed } from 'vue'
import { api, getToken, setToken, clearToken, type User } from '@/lib/api'

// Module-level singleton state shared across the app.
const token = ref<string | null>(getToken())
const user = ref<User | null>(null)
const ready = ref(false)

export function useAuth() {
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string): Promise<User> {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    setToken(data.token)
    token.value = data.token
    user.value = data.user
    return data.user
  }

  function logout(): void {
    clearToken()
    token.value = null
    user.value = null
  }

  // Resolves the current session from a stored token (called by the router guard).
  async function ensureSession(): Promise<User | null> {
    if (user.value) return user.value
    if (!token.value) {
      ready.value = true
      return null
    }
    try {
      const data = await api.get<{ user: User }>('/auth/me')
      user.value = data.user
    } catch {
      logout()
    } finally {
      ready.value = true
    }
    return user.value
  }

  return { token, user, ready, isAdmin, isAuthenticated, login, logout, ensureSession }
}
