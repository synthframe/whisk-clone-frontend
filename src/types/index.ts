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

export interface GenerateRequest {
  subject_prompt: string
  scene_prompt: string
  style_prompt: string
  style_preset: StylePreset | ''
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
