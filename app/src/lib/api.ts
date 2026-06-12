import { supabase } from '@/lib/supabase'

// ============================================================================
// Data layer — Supabase Postgres (replaces the old Express/SQLite backend).
// ----------------------------------------------------------------------------
// The public surface (`api.get/post/put/del` + REST-ish paths) is preserved so
// the rest of the app is untouched, but every call now hits Supabase directly
// with Row Level Security enforcing the same rules the backend used to:
//   • public (anon) reads visible rows only
//   • any authenticated user reads everything and can write
// A small resource registry maps each path segment to its table + response
// envelope, keeping all the query logic in one typed place.
// ============================================================================

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function check(error: { message: string } | null): void {
  if (error) throw new ApiError(error.message)
}

// ── Resource registry ────────────────────────────────────────────────────────
type Res = { table: string; list: string; item: string; slugFrom?: 'name' | 'title' }

const RES: Record<string, Res> = {
  sections: { table: 'sections', list: 'sections', item: 'section' },
  team: { table: 'team_members', list: 'members', item: 'member', slugFrom: 'name' },
  portfolio: { table: 'portfolio_items', list: 'items', item: 'item', slugFrom: 'title' },
  nav: { table: 'nav_items', list: 'items', item: 'item' },
  services: { table: 'services', list: 'items', item: 'item' },
  articles: { table: 'articles', list: 'items', item: 'item', slugFrom: 'title' },
  partners: { table: 'partners', list: 'items', item: 'item' },
  testimonials: { table: 'testimonials', list: 'items', item: 'item' },
  'pricing-items': { table: 'pricing_items', list: 'items', item: 'item' },
  'pricing-formulas': { table: 'pricing_formulas', list: 'items', item: 'item' },
  promotions: { table: 'promotions', list: 'items', item: 'item', slugFrom: 'title' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return (
    String(str)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'item'
  )
}

async function uniqueSlug(table: string, base: string, ignoreId?: number): Promise<string> {
  let slug = base
  let n = 1
  for (;;) {
    let query = supabase.from(table).select('id').eq('slug', slug)
    if (ignoreId != null) query = query.neq('id', ignoreId)
    const { data } = await query.limit(1)
    if (!data || data.length === 0) return slug
    slug = `${base}-${++n}`
  }
}

async function nextPosition(table: string): Promise<number> {
  const { data } = await supabase.from(table).select('position').order('position', { ascending: false }).limit(1)
  return (data && data[0] ? (data[0].position as number) : -1) + 1
}

function parse(path: string): { segs: string[]; params: URLSearchParams } {
  const [p, qs] = path.split('?')
  return { segs: p.split('/').filter(Boolean), params: new URLSearchParams(qs || '') }
}

async function settingsObject(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('key, value')
  return Object.fromEntries((data || []).map((r: any) => [r.key, r.value]))
}

// ── Verbs ────────────────────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const { segs, params } = parse(path)
  const admin = segs[0] === 'admin'
  const res = admin ? segs[1] : segs[0]
  const rest = admin ? segs.slice(2) : segs.slice(1)

  if (res === 'settings') return { settings: await settingsObject() } as T

  const cfg = RES[res]
  if (!cfg) throw new ApiError(`Ressource inconnue: ${res}`, 404)

  // public single by slug (/team/:slug, /portfolio/:slug)
  if (!admin && rest.length === 1) {
    const { data, error } = await supabase
      .from(cfg.table)
      .select('*')
      .eq('slug', rest[0])
      .eq('visible', 1)
      .limit(1)
    check(error)
    if (!data || !data.length) throw new ApiError('Introuvable', 404)
    return { [cfg.item]: data[0] } as T
  }

  // list
  let query = supabase
    .from(cfg.table)
    .select('*')
    .order('position', { ascending: true })
    .order('id', { ascending: true })
  if (!admin) query = query.eq('visible', 1)
  if (res === 'sections' && params.get('page')) query = query.eq('page', params.get('page'))
  if (res === 'portfolio' && params.get('category')) query = query.eq('category', params.get('category'))

  const { data, error } = await query
  check(error)
  const rows = data || []

  if (res === 'portfolio' && !admin) {
    const categories = [...new Set(rows.map((r: any) => r.category).filter(Boolean))].sort()
    return { items: rows, categories } as T
  }
  return { [cfg.list]: rows } as T
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const { segs } = parse(path)
  const res = segs[1]
  const cfg = RES[res]
  if (!cfg) throw new ApiError(`Ressource inconnue: ${res}`, 404)

  const b = { ...(body as Record<string, any>) }
  const row: Record<string, any> = { ...b, visible: 1, position: await nextPosition(cfg.table) }
  if (cfg.slugFrom) row.slug = await uniqueSlug(cfg.table, slugify(b[cfg.slugFrom] || res))

  const { data, error } = await supabase.from(cfg.table).insert(row).select('*').limit(1)
  check(error)
  return { [cfg.item]: data && data[0] } as T
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  const { segs } = parse(path)
  const res = segs[1]
  const tail = segs[2]

  if (res === 'settings') {
    const settings = ((body as any)?.settings || {}) as Record<string, unknown>
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value ?? '') }))
    if (rows.length) {
      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
      check(error)
    }
    return { settings: await settingsObject() } as T
  }

  const cfg = RES[res]
  if (!cfg) throw new ApiError(`Ressource inconnue: ${res}`, 404)

  if (tail === 'reorder') {
    const ids: number[] = ((body as any)?.ids || []) as number[]
    await Promise.all(ids.map((id, i) => supabase.from(cfg.table).update({ position: i }).eq('id', id)))
    return { ok: true } as T
  }

  const id = Number(tail)
  const patch = { ...(body as Record<string, any>) }
  if ('visible' in patch) patch.visible = patch.visible ? 1 : 0
  if (cfg.slugFrom && patch[cfg.slugFrom] != null) {
    patch.slug = await uniqueSlug(cfg.table, slugify(patch[cfg.slugFrom]), id)
  }

  const { data, error } = await supabase.from(cfg.table).update(patch).eq('id', id).select('*').limit(1)
  check(error)
  return { [cfg.item]: data && data[0] } as T
}

async function del<T>(path: string): Promise<T> {
  const { segs } = parse(path)
  const res = segs[1]
  const id = Number(segs[2])
  const cfg = RES[res]
  if (!cfg) throw new ApiError(`Ressource inconnue: ${res}`, 404)

  // Team: re-parent a deleted node's children onto its own parent (as the
  // backend did) so the org chart never loses a whole subtree.
  if (res === 'team') {
    const { data } = await supabase.from('team_members').select('parent_id').eq('id', id).limit(1)
    const parentId = data && data[0] ? data[0].parent_id : null
    await supabase.from('team_members').update({ parent_id: parentId }).eq('parent_id', id)
  }

  const { error } = await supabase.from(cfg.table).delete().eq('id', id)
  check(error)
  return { ok: true } as T
}

export const api = {
  get,
  post,
  put,
  del,
}

// ── Types (shared across the app) ────────────────────────────────────────────
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

export interface PromoCode {
  code: string
  label: string
  discount: string
  description: string
}

export interface Promotion {
  id: number
  title: string
  slug: string
  category: string
  body: string
  image: string
  link_url: string
  animation: string
  featured: number
  qr_target: string
  subtitle: string
  details: string
  conditions: string
  merchant_name: string
  merchant_email: string
  valid_until: string
  codes: PromoCode[]
  position: number
  visible: number
}

export interface Order {
  id: number
  promotion_id: number | null
  promotion_title: string
  promo_code: string
  offer_label: string
  customer_name: string
  customer_email: string
  customer_phone: string
  message: string
  status: string
  created_at: string
}
