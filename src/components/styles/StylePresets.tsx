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
]

export function StylePresets() {
  const { selectedPreset, setPreset } = useGenerateStore()

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPreset(selectedPreset === p.value ? '' : p.value)}
          className={`px-3 py-1.5 text-xs font-mono font-medium transition-all uppercase tracking-widest border
            ${selectedPreset === p.value
              ? 'bg-black text-black border-white'
              : 'border-black/20 text-black/70 hover:bg-white hover:text-black hover:border-white'}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
