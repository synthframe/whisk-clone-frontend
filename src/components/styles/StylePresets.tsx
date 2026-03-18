import { useGenerateStore } from '../../store/generateStore'
import type { StylePreset } from '../../types'

const PRESETS: { value: StylePreset; label: string }[] = [
  { value: 'photorealistic', label: 'Photo' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'oil_painting', label: 'Oil Paint' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'pixel_art', label: 'Pixel Art' },
  { value: 'sketched', label: 'Sketch' },
  { value: 'pixar_3d', label: 'Pixar 3D' },
]

export function StylePresets() {
  const { selectedPreset, setPreset } = useGenerateStore()
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setPreset(selectedPreset === value ? '' : value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            selectedPreset === value
              ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
              : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
