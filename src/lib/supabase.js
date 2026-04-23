import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const BUCKET = 'gallery'
export const MUSIC_BUCKET = 'music'

// ── MEDIA (photos / videos) ──────────────────────────────────────────────────

export async function fetchMedia() {
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    sortBy: { column: 'created_at', order: 'asc' },
  })
  if (error) throw error
  return data.map((file) => ({
    name: file.name,
    url: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl,
    isVideo: /\.(mp4|webm|mov|avi)$/i.test(file.name),
  }))
}

export async function uploadFile(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return fileName
}

export async function deleteFile(fileName) {
  const { error } = await supabase.storage.from(BUCKET).remove([fileName])
  if (error) throw error
}

// ── MUSIC ────────────────────────────────────────────────────────────────────

export async function fetchMusic() {
  try {
    const { data, error } = await supabase.storage.from(MUSIC_BUCKET).list('', {
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (error || !data?.length) return null
    const audio = data.find(f => /\.(mp3|ogg|wav|m4a|aac)$/i.test(f.name))
    if (!audio) return null
    return {
      name: audio.name,
      url: supabase.storage.from(MUSIC_BUCKET).getPublicUrl(audio.name).data.publicUrl,
    }
  } catch {
    return null
  }
}

export async function uploadMusic(file) {
  // Garde UN seul fichier : efface l'ancien d'abord
  try {
    const { data: existing } = await supabase.storage.from(MUSIC_BUCKET).list('')
    if (existing?.length) {
      await supabase.storage.from(MUSIC_BUCKET).remove(existing.map(f => f.name))
    }
  } catch {}
  const ext = file.name.split('.').pop()
  const fileName = `music_${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(MUSIC_BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  return fileName
}

export async function deleteMusic(name) {
  const { error } = await supabase.storage.from(MUSIC_BUCKET).remove([name])
  if (error) throw error
}
