import { useRef, useState } from 'react'
import { useSlotStore } from '../../store/slotStore'
import { useSlotUpload } from '../../hooks/useSlotUpload'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import type { SlotType } from '../../types'

const SLOT_LABELS: Record<SlotType, string> = {
  subject: 'Subject',
  scene: 'Scene',
  style: 'Style',
}

const SLOT_DESCRIPTIONS: Record<SlotType, string> = {
  subject: 'Main character or object',
  scene: 'Background / environment',
  style: 'Artistic style & mood',
}

interface Props {
  type: SlotType
}

export function SlotCard({ type }: Props) {
  const slot = useSlotStore((s) => s.slots[type])
  const setSlot = useSlotStore((s) => s.setSlot)
  const { upload, clearSlot } = useSlotUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<'image' | 'text'>('text')

  const handleFile = (file: File) => upload(type, file)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const hasContent = slot.file || slot.prompt

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between border-b border-black/10 pb-2">
        <div>
          <h3 className="font-mono font-semibold text-black uppercase tracking-widest text-sm">{SLOT_LABELS[type]}</h3>
          <p className="text-xs text-black/40 font-mono mt-0.5">{SLOT_DESCRIPTIONS[type]}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex border border-black/20">
            <button
              onClick={() => setInputMode('image')}
              className={`px-2 py-0.5 text-xs font-mono transition-all uppercase tracking-widest ${
                inputMode === 'image' ? 'bg-black text-black' : 'text-black/50 hover:bg-white hover:text-black'
              }`}
            >
              이미지
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-2 py-0.5 text-xs font-mono transition-all uppercase tracking-widest ${
                inputMode === 'text' ? 'bg-black text-black' : 'text-black/50 hover:bg-white hover:text-black'
              }`}
            >
              텍스트
            </button>
          </div>
          {hasContent && (
            <button
              onClick={() => clearSlot(type)}
              className="text-black/30 hover:text-black text-xs transition-colors font-mono"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {inputMode === 'image' ? (
        <>
          <div
            className={`relative aspect-square border border-dashed transition-all cursor-pointer overflow-hidden
              ${slot.preview ? 'border-black/20' : 'border-black/20 hover:border-black/60'}`}
            onClick={() => !slot.preview && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {slot.preview ? (
              <>
                <img src={slot.preview} alt={type} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0 bg-white/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  <span className="text-black text-xs font-mono uppercase tracking-widest border border-black/40 px-3 py-1">Change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                <div className="w-10 h-10 border border-black/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-black/40 text-xs text-center font-mono">Drop image or click to upload</span>
              </div>
            )}
            {slot.analyzing && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-black text-xs font-mono uppercase tracking-widest">Analyzing...</span>
              </div>
            )}
          </div>
          {slot.prompt && <p className="text-xs text-black/50 italic line-clamp-3 font-mono">{slot.prompt}</p>}
          {slot.error && <p className="text-xs text-black/40 font-mono">{slot.error}</p>}
        </>
      ) : (
        <textarea
          value={slot.prompt}
          onChange={(e) => setSlot(type, { prompt: e.target.value })}
          placeholder={`${SLOT_DESCRIPTIONS[type]}를 텍스트로 입력하세요`}
          rows={5}
          className="w-full bg-white text-black border border-black/20 px-3 py-2 text-xs font-mono
            focus:outline-none focus:border-black/60 resize-none
            placeholder:text-black/20 transition-colors"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
