import { supabase } from '@/lib/supabase'

const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'media'

// Best-effort unique, extension-preserving object name. crypto.randomUUID is
// available in all modern browsers; we fall back to a timestamp + random.
function uniqueName(source: string): string {
  const ext = (source.match(/\.[a-zA-Z0-9]+$/)?.[0] || '.jpg').toLowerCase()
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  return `${id}${ext}`
}

// Uploads an image/video to Supabase Storage and returns its public URL.
// Writes require an authenticated session (enforced by the bucket's RLS policy);
// a Blob (e.g. a cropped canvas export) carries an explicit filename for the ext.
export async function uploadImage(file: File | Blob, filename = 'image.jpg'): Promise<string> {
  const name = uniqueName(file instanceof File ? file.name : filename)
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw new Error(error.message || 'Échec du téléversement')

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name)
  return data.publicUrl
}
