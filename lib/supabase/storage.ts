import { supabaseAdmin } from './client'

export async function uploadDekont(file: File, tip: 'gelir' | 'gider', id: string) {
  const date = new Date()
  const path = `${tip}/${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,'0')}/${id}-${file.name}`
  const { data, error } = await supabaseAdmin.storage.from('dekontlar').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabaseAdmin.storage.from('dekontlar').getPublicUrl(path)
  return publicUrl
}
