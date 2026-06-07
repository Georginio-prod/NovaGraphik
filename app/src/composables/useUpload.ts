import { getAccessToken } from '@/lib/api'

// Uploads a file/blob to the media endpoint and returns its public URL
// (/uploads/..). A Blob (e.g. a cropped canvas export) needs an explicit
// filename so the server can derive the extension.
export async function uploadImage(file: File | Blob, filename = 'image.jpg'): Promise<string> {
  const fd = new FormData()
  fd.append('file', file, file instanceof File ? file.name : filename)
  const token = await getAccessToken()
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Upload échoué')
  return (data as { url: string }).url
}
