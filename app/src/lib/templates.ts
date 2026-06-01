// NOVA GRAPHIK — section templates. Shared by the dashboard (template chooser +
// per-template editor fields) and the public renderer (CmsContentSection), so an
// added section always matches the site's design.

export type FieldKey = 'eyebrow' | 'title' | 'body' | 'icon' | 'image' | 'items' | 'button'
export type ItemShape = 'feature' | 'image'

export interface SectionTemplate {
  key: string
  label: string
  description: string
  previewIcon: string
  fields: FieldKey[]
  itemShape?: ItemShape
  defaults: {
    type: string
    title: string
    body: string
    icon?: string
    image?: string
    data?: Record<string, unknown>
  }
}

export const TEMPLATES: SectionTemplate[] = [
  {
    key: 'text',
    label: 'Texte centré',
    description: 'Un intertitre, un titre et un paragraphe — sobre et éditorial.',
    previewIcon: 'file-text',
    fields: ['eyebrow', 'title', 'body'],
    defaults: { type: 'Section', title: 'Nouveau titre', body: 'Votre contenu ici…' },
  },
  {
    key: 'feature',
    label: 'Mise en avant (icône)',
    description: 'Un logo/icône, un titre et une description. Idéal « Nos services ».',
    previewIcon: 'sparkles',
    fields: ['eyebrow', 'icon', 'title', 'body'],
    defaults: { type: 'Atout', title: 'Notre savoir-faire', body: 'Décrivez cet atout…', icon: 'sparkles' },
  },
  {
    key: 'cards',
    label: 'Grille de cartes',
    description: 'Plusieurs cartes (icône + titre + description), comme la grille de services.',
    previewIcon: 'layout-dashboard',
    fields: ['eyebrow', 'title', 'body', 'items'],
    itemShape: 'feature',
    defaults: {
      type: 'Prestations',
      title: 'Nos prestations',
      body: '',
      data: {
        items: [
          { icon: 'palette', title: 'Identité visuelle', desc: 'Logos & chartes graphiques.' },
          { icon: 'monitor', title: 'Web & UX/UI', desc: 'Sites vitrine & e-commerce.' },
          { icon: 'camera', title: 'Photo & vidéo', desc: 'Shooting & montage.' },
        ],
      },
    },
  },
  {
    key: 'gallery',
    label: 'Galerie d’images',
    description: 'Une grille d’images (réalisations, visuels…).',
    previewIcon: 'image',
    fields: ['eyebrow', 'title', 'body', 'items'],
    itemShape: 'image',
    defaults: { type: 'Galerie', title: 'En images', body: '', data: { items: [] } },
  },
  {
    key: 'banner',
    label: 'Bannière sombre',
    description: 'Bloc plein cadre teal-navy avec titre — fort impact.',
    previewIcon: 'layers',
    fields: ['eyebrow', 'title', 'body'],
    defaults: { type: 'Bannière', title: 'Un message fort', body: 'Sous-titre de la bannière…' },
  },
  {
    key: 'cta',
    label: 'Appel à l’action',
    description: 'Titre, texte et un bouton — pour inciter à vous contacter.',
    previewIcon: 'megaphone',
    fields: ['title', 'body', 'button'],
    defaults: {
      type: 'CTA',
      title: 'Donnons vie à votre marque.',
      body: 'Parlons de votre projet — réponse sous 24 h.',
      data: { buttonLabel: 'Demander un devis', buttonLink: '/contact' },
    },
  },
]

export function getTemplate(key: string): SectionTemplate {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0]
}

export function templateUses(key: string, field: FieldKey): boolean {
  return getTemplate(key).fields.includes(field)
}
