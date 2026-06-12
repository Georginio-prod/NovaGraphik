import QRCode from 'qrcode'

// Thin wrapper around the `qrcode` library (browser build). Generates a PNG data
// URL entirely client-side — no external service, works offline — themed with
// the Nova navy on a white background so codes stay scannable.
export async function qrDataUrl(text: string, size = 240): Promise<string> {
  const value = (text || '').trim()
  if (!value) return ''
  return QRCode.toDataURL(value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#022c3d', light: '#ffffff' },
  })
}
