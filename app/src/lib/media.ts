// Shared media helpers. Portfolio galleries store both image and video URLs in
// the same list, so the UI decides how to render each entry by its extension.
export function isVideoUrl(url: string | undefined | null): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url || '')
}

// Display formats for videos (TikTok / Reels / Stories / Feed / YouTube …).
// We don't transcode the file — only the player's display aspect ratio. The
// chosen format is encoded in the stored URL as `?ar=<code>` so no DB/schema
// change is needed; the static server ignores the query and still serves the file.
export interface VideoFormat {
  code: string
  label: string
  css: string // CSS aspect-ratio value
}

export const VIDEO_FORMATS: VideoFormat[] = [
  { code: '9-16', label: 'Vertical 9:16 · TikTok / Reels / Shorts', css: '9 / 16' },
  { code: '4-5', label: 'Portrait 4:5 · Feed Instagram', css: '4 / 5' },
  { code: '1-1', label: 'Carré 1:1', css: '1 / 1' },
  { code: '191-100', label: 'Paysage 1.91:1', css: '191 / 100' },
  { code: '16-9', label: 'Paysage 16:9 · YouTube', css: '16 / 9' },
]

export const DEFAULT_VIDEO_FORMAT = '16-9'

export function getMediaMeta(url: string | undefined | null): { base: string; ratio: string } {
  const [base, query = ''] = (url || '').split('?')
  const ratio = new URLSearchParams(query).get('ar') || ''
  return { base, ratio }
}

// Returns the URL with its `ar` format code set (or stripped when default/empty).
export function withRatio(url: string, code: string): string {
  const { base } = getMediaMeta(url)
  return code ? `${base}?ar=${code}` : base
}

// CSS aspect-ratio for a format code (falls back to 16:9).
export function ratioCss(code: string): string {
  return VIDEO_FORMATS.find((f) => f.code === code)?.css || '16 / 9'
}

// CSS aspect-ratio carried by a media URL's `?ar=` tag, or '' when none.
// Image crops bake the chosen format into the file *and* record it here so the
// display can size its frame to match — otherwise object-cover would re-crop the
// image back to the container's fixed shape. Handles both video format codes
// (e.g. `16-9`) and the raw `<w>-<h>` ratios written by the image cropper.
export function aspectCss(url: string | undefined | null): string {
  const ar = getMediaMeta(url).ratio
  if (!ar) return ''
  const vf = VIDEO_FORMATS.find((f) => f.code === ar)
  if (vf) return vf.css
  const m = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(ar)
  return m ? `${m[1]} / ${m[2]}` : ''
}

// A <video> with preload="metadata" shows a black box until played. Appending a
// `#t=` media fragment makes the browser render that frame as a poster. Used at
// render time only (never re-parsed for the format), so it keeps `?ar=` intact.
export function posterSrc(url: string): string {
  if (!url || url.includes('#')) return url
  return `${url}#t=0.1`
}
