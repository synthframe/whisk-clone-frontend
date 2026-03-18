export type SlotType = 'subject' | 'scene' | 'style'

export type StylePreset =
  | 'photorealistic'
  | 'cinematic'
  | 'anime'
  | 'oil_painting'
  | 'watercolor'
  | 'pixel_art'
  | 'sketched'
  | 'pixar_3d'

export interface AnalyzeResponse {
  prompt: string
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

export const RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '9:16': { width: 576,  height: 1024 },
  '4:3':  { width: 1024, height: 768 },
  '3:4':  { width: 768,  height: 1024 },
}

export interface GenerateRequest {
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
  style_preset: StylePreset | ''
  width?: number
  height?: number
}

export interface GenerateResponse {
  id: string
  status: 'processing' | 'completed' | 'failed'
  image_url?: string
  error?: string
}

export interface BatchJobInput {
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
  style_preset: StylePreset | ''
  width?: number
  height?: number
}

export interface BatchRequest {
  jobs: BatchJobInput[]
  concurrency?: number
}

export interface BatchResponse {
  batch_id: string
  total: number
}

export interface BatchJobResult {
  index: number
  status: 'completed' | 'failed' | ''
  image_url?: string
  error?: string
}

export interface BatchStatusResponse {
  batch_id: string
  status: string
  total: number
  completed: number
  failed: number
  results: BatchJobResult[]
}

export interface SSEEvent {
  type: 'job_started' | 'job_completed' | 'job_failed' | 'batch_completed' | 'heartbeat'
  timestamp: string
  payload: Record<string, unknown>
}

export interface HealthResponse {
  status: string
  model: string
  api_key_set: boolean
}
