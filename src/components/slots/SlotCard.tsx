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

  const handleFile = (file: File) => {
    upload(type, file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const handleClear = () => {
    clearSlot(type)
  }

  const hasContent = slot.file || slot.prompt

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{SLOT_LABELS[type]}</h3>
          <p className="text-xs text-white/50">{SLOT_DESCRIPTIONS[type]}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 이미지/텍스트 모드 토글 */}
          <div className="flex items-center bg-white/10 rounded-md p-0.5">
            <button
              onClick={() => setInputMode('image')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                inputMode === 'image' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
              }`}
            >
              이미지
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                inputMode === 'text' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
              }`}
            >
              텍스트
            </button>
          </div>
          {hasContent && (
            <button
              onClick={handleClear}
              className="text-white/40 hover:text-white/80 text-xs transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {inputMode === 'image' ? (
        <>
          <div
            className={`relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
              ${slot.preview ? 'border-transparent' : 'border-white/20 hover:border-white/40 bg-white/5'}`}
            onClick={() => !slot.preview && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {slot.preview ? (
              <>
                <img src={slot.preview} alt={type} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  <span className="text-white text-sm">Change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-white/50 text-xs text-center">Drop image or click to upload</span>
              </div>
            )}

            {slot.analyzing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-white text-sm">Analyzing...</span>
              </div>
            )}
          </div>

          {slot.prompt && (
            <p className="text-xs text-white/60 italic line-clamp-3">{slot.prompt}</p>
          )}
          {slot.error && (
            <p className="text-xs text-red-400">{slot.error}</p>
          )}
        </>
      ) : (
        <textarea
          value={slot.prompt}
          onChange={(e) => setSlot(type, { prompt: e.target.value })}
          placeholder={`${SLOT_DESCRIPTIONS[type]}를 텍스트로 입력하세요`}
          rows={5}
          className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-xs font-mono
            focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none
            placeholder:text-white/20"
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
