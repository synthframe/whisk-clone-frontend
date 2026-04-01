import { client } from './client'

export interface RefineRequest {
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
  style_preset: string
  width: number
  height: number
  feedback: string
  original_url: string
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface RefineResponse {
  image_url: string
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
}

export async function refineImage(req: RefineRequest): Promise<RefineResponse> {
  const { data } = await client.post<RefineResponse>('/refine', req)
  return data
}
