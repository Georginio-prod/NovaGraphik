// Helpers for the dashboard image cropper. Remote URLs (e.g. Supabase Storage)
// taint a <canvas> unless the pixels are loaded same-origin — fetch to a blob
// URL before opening the cropper so export via toBlob always works.

export async function fetchImageBlobUrl(url: string): Promise<string> {
  if (url.startsWith('blob:') || url.startsWith('data:')) return url

  const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
  if (!res.ok) throw new Error('Impossible de charger l’image pour l’ajustement')
  return URL.createObjectURL(await res.blob())
}
