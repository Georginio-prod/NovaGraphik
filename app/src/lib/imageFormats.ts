// Predefined output formats offered in the image cropper. `aspect` is width /
// height; `null` means "free" (keep the source image's natural ratio). These are
// shared by every upload in the dashboard so a single picker drives them all.

export interface ImageFormat {
  key: string
  label: string
  /** width / height, or null for the image's natural ratio */
  aspect: number | null
  /** lucide icon hinting the orientation */
  icon: string
}

export const IMAGE_FORMATS: ImageFormat[] = [
  { key: 'free', label: 'Libre', aspect: null, icon: 'maximize' },
  { key: 'square', label: 'Carré 1:1', aspect: 1, icon: 'square' },
  { key: 'landscape-16-9', label: 'Horizontal 16:9', aspect: 16 / 9, icon: 'rectangle-horizontal' },
  { key: 'landscape-3-2', label: 'Horizontal 3:2', aspect: 3 / 2, icon: 'rectangle-horizontal' },
  { key: 'portrait-4-5', label: 'Vertical 4:5', aspect: 4 / 5, icon: 'rectangle-vertical' },
  { key: 'portrait-9-16', label: 'Story 9:16', aspect: 9 / 16, icon: 'smartphone' },
  { key: 'a4-portrait', label: 'A4 portrait', aspect: 210 / 297, icon: 'file' },
  { key: 'a4-landscape', label: 'A4 paysage', aspect: 297 / 210, icon: 'file' },
]
