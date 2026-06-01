// NOVA GRAPHIK — branded teal→green gradients used by placeholders & surfaces.
export const NOVA_GRADS = [
  'linear-gradient(135deg,#034159,#02735E)',
  'linear-gradient(135deg,#022c3d,#025951)',
  'linear-gradient(135deg,#025951,#038C3E)',
  'linear-gradient(135deg,#0a4f68,#02735E)',
  'linear-gradient(135deg,#034159,#038C3E)',
  'linear-gradient(135deg,#02735E,#0a4f68)',
] as const

export function novaGrad(idx: number): string {
  return NOVA_GRADS[((idx % NOVA_GRADS.length) + NOVA_GRADS.length) % NOVA_GRADS.length]
}
