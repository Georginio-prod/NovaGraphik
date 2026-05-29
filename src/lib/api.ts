// Tiny typed fetch wrapper around the Nova Graphik API.
const TOKEN_KEY = 'nova_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || 'Erreur réseau', res.status)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}

export interface User {
  id: number
  email: string
  role: string
}
export interface Section {
  id: number
  page: string
  type: string
  template: string
  title: string
  body: string
  icon: string
  image: string
  data: Record<string, any>
  visible: number
  position: number
}

export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  photo: string
  slug: string
  parent_id: number | null
  position: number
  visible: number
}

export interface PortfolioItem {
  id: number
  title: string
  slug: string
  category: string
  description: string
  cover_image: string
  images: string[]
  position: number
  visible: number
}
