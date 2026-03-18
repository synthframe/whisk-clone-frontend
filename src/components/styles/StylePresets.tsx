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
  { value: 'pixar_3d', label: '3D Pixar' },
]

export function StylePresets() {
  const { selectedPreset, setPreset } = useGenerateStore()

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPreset(selectedPreset === p.value ? '' : p.value)}
          className={`px-4 py-2 text-sm font-mono font-bold transition-all uppercase tracking-widest border-2
            ${selectedPreset === p.value
              ? 'bg-black text-white border-black'
              : 'border-black text-black hover:bg-black hover:text-white'}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
