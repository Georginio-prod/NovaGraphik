import { supabase } from '@/lib/supabase'

// Tiny typed fetch wrapper around the Nova Graphik API.
// Auth is delegated to Supabase: every request reads the current access token
// from the active session and forwards it as Authorization: Bearer <token>.

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
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
  const token = await getAccessToken()
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
  external_url: string
  position: number
  visible: number
}

export interface NavItem {
  id: number
  label: string
  path: string
  position: number
  visible: number
}

export interface Service {
  id: number
  icon: string
  title: string
  description: string
  position: number
  visible: number
}

export interface Article {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  body: string
  cover_image: string
  date: string
  position: number
  visible: number
}

export interface Partner {
  id: number
  name: string
  logo_url: string
  position: number
  visible: number
}

export interface Testimonial {
  id: number
  quote: string
  author_name: string
  author_role: string
  position: number
  visible: number
}

export interface PricingItem {
  id: number
  group_title: string
  group_icon: string
  name: string
  description: string
  price: string
  position: number
  visible: number
}

export interface PricingFormula {
  id: number
  name: string
  price: string
  features: string[]
  is_hot: number
  position: number
  visible: number
}
