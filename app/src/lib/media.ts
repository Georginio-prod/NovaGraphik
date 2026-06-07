// Shared media helpers. Portfolio galleries store both image and video URLs in
// the same list, so the UI decides how to render each entry by its extension.
export function isVideoUrl(url: string | undefined | null): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url || '')
}
