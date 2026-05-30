import { getAccessToken } from '@/lib/api'

// Uploads a file to the media endpoint and returns its public URL (/uploads/..).
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
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
