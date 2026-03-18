import { client } from './client'

export interface ImageHistoryItem {
  id: string
  url: string
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
  style_preset: string
  width: number
  height: number
  created_at: string
}

export async function getImages(): Promise<ImageHistoryItem[]> {
  const res = await client.get('/images')
  return res.data
}
