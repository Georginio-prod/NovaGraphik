// Predefined entrance animations for promotion publications. The admin picks one
// per publication in the dashboard; the public page applies the matching CSS
// class (keyframes live in assets/css/main.css). Keeping the catalogue here means
// the dashboard <select> and the renderer never drift apart.

export interface PromoAnimation {
  key: string
  label: string
  /** CSS class that runs the keyframes (defined in main.css) */
  className: string
}

export const PROMO_ANIMATIONS: PromoAnimation[] = [
  { key: 'fade', label: 'Fondu', className: 'promo-anim-fade' },
  { key: 'rise', label: 'Apparition (bas → haut)', className: 'promo-anim-rise' },
  { key: 'slide-left', label: 'Glissement depuis la gauche', className: 'promo-anim-slide-left' },
  { key: 'slide-right', label: 'Glissement depuis la droite', className: 'promo-anim-slide-right' },
  { key: 'zoom', label: 'Zoom', className: 'promo-anim-zoom' },
  { key: 'flip', label: 'Retournement', className: 'promo-anim-flip' },
  { key: 'pop', label: 'Pop (rebond)', className: 'promo-anim-pop' },
]

const BY_KEY = new Map(PROMO_ANIMATIONS.map((a) => [a.key, a]))

export function animationClass(key: string | undefined): string {
  return (key && BY_KEY.get(key)?.className) || 'promo-anim-fade'
}

/** Options shaped for the dashboard <select> field. */
export const PROMO_ANIMATION_OPTIONS = PROMO_ANIMATIONS.map((a) => ({ value: a.key, label: a.label }))
