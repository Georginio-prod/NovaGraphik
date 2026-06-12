import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/api'

export interface NewOrder {
  promotion_id: number | null
  promotion_title: string
  promo_code: string
  offer_label: string
  customer_name: string
  customer_email: string
  customer_phone: string
  message: string
}

// Public: insert the order (RLS allows anonymous insert) — this is the durable
// proof — then best-effort fire the notify-order Edge Function to email Nova, the
// merchant and the customer. Email failure never loses the order.
export async function createOrder(order: NewOrder, merchantEmail = ''): Promise<void> {
  const { error } = await supabase.from('orders').insert({ ...order, status: 'nouveau' })
  if (error) throw new Error(error.message || 'Échec de l’enregistrement de la commande')

  try {
    await supabase.functions.invoke('notify-order', {
      body: { ...order, merchant_email: merchantEmail },
    })
  } catch {
    // Notification is best-effort; the order is already saved (visible in the
    // dashboard "Commandes" inbox).
  }
}

// Admin: list / update / delete orders (requires an authenticated session).
export function useOrders() {
  const items = ref<Order[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    const { data, error: e } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (e) error.value = 'Impossible de charger les commandes.'
    else items.value = (data as Order[]) || []
    loading.value = false
  }

  async function setStatus(id: number, status: string) {
    const it = items.value.find((o) => o.id === id)
    if (it) it.status = status
    await supabase.from('orders').update({ status }).eq('id', id)
  }

  async function remove(id: number) {
    items.value = items.value.filter((o) => o.id !== id)
    await supabase.from('orders').delete().eq('id', id)
  }

  return { items, loading, error, load, setStatus, remove }
}
