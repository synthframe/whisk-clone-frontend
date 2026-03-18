import { create } from 'zustand'
import type { StylePreset, AspectRatio } from '../types'

interface GenerateStore {
  selectedPreset: StylePreset | ''
  selectedRatio: AspectRatio
  generating: boolean
  resultImageUrl: string | null
  resultTs: number
  jobId: string | null
  error: string | null
  setPreset: (preset: StylePreset | '') => void
  setRatio: (ratio: AspectRatio) => void
  setGenerating: (v: boolean) => void
  setResult: (url: string | null) => void
  setJobId: (id: string | null) => void
  setError: (e: string | null) => void
}

export const useGenerateStore = create<GenerateStore>((set) => ({
  selectedPreset: 'photorealistic',
  selectedRatio: '1:1',
  generating: false,
  resultImageUrl: null,
  resultTs: 0,
  jobId: null,
  error: null,
  setPreset: (preset) => set({ selectedPreset: preset }),
  setRatio: (ratio) => set({ selectedRatio: ratio }),
  setGenerating: (v) => set({ generating: v }),
  setResult: (url) => set({ resultImageUrl: url, resultTs: url ? Date.now() : 0 }),
  setJobId: (id) => set({ jobId: id }),
  setError: (e) => set({ error: e }),
}))
