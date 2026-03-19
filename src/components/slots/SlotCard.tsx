import { useRef } from 'react'
import { Upload, Type, X, Loader2, Image as ImageIcon } from 'lucide-react'
import type { SlotType } from '../../types'
import { useSlotStore } from '../../store/slotStore'
import { useSlotUpload } from '../../hooks/useSlotUpload'

const SLOT_CONFIG = {
  subject: {
    label: '주제',
    desc: '인물 · 사물 · 동물',
    color: 'from-blue-600/20 to-cyan-600/20',
    accent: 'bg-blue-500',
    focus: 'focus:border-blue-500/50',
    placeholder: 'e.g. a Korean girl, close up portrait, detailed eyes',
  },
  scene: {
    label: '배경',
    desc: '장소 · 환경 · 공간',
    color: 'from-emerald-600/20 to-teal-600/20',
    accent: 'bg-emerald-500',
    focus: 'focus:border-emerald-500/50',
    placeholder: 'e.g. night city street, neon lights, rainy atmosphere',
  },
  style: {
    label: '스타일',
    desc: '화풍 · 색감 · 조명',
    color: 'from-violet-600/20 to-purple-600/20',
    accent: 'bg-violet-500',
    focus: 'focus:border-violet-500/50',
    placeholder: 'e.g. cinematic lighting, film grain, warm tones',
  },
}

interface Props {
  type: SlotType
  inputMode: 'image' | 'text'
  onModeChange: (mode: 'image' | 'text') => void
}

export function SlotCard({ type, inputMode, onModeChange }: Props) {
  const slot = useSlotStore(s => s.slots[type])
  const { upload, clearSlot } = useSlotUpload()
  const fileRef = useRef<HTMLInputElement>(null)
  const cfg = SLOT_CONFIG[type]

  function handleFile(file: File) {
    if (file.type.startsWith('image/')) upload(type, file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const hasContent = slot.prompt.trim().length > 0 || !!slot.preview

  return (
    <div className={`rounded-2xl bg-[#141418] border transition-all duration-200 overflow-hidden ${
      hasContent ? 'border-white/[0.14]' : 'border-white/[0.07] hover:border-white/[0.12]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] bg-[#111115]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.accent}`} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100">{cfg.label}</p>
            <p className="text-xs text-slate-600 truncate mt-0.5">{cfg.desc}</p>
          </div>
        </div>
        {/* Mode toggle */}
        <div className="flex bg-[#0c0c0f] rounded-xl p-1 gap-1 flex-shrink-0 ml-3">
          <button
            onClick={() => onModeChange('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              inputMode === 'image'
                ? 'bg-white/[0.1] text-slate-100 shadow-sm'
                : 'text-slate-600 hover:text-slate-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
            이미지
          </button>
          <button
            onClick={() => onModeChange('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              inputMode === 'text'
                ? 'bg-white/[0.1] text-slate-100 shadow-sm'
                : 'text-slate-600 hover:text-slate-300'
            }`}
          >
            <Type className="w-3.5 h-3.5 flex-shrink-0" />
            텍스트
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {inputMode === 'image' ? (
          <div className="space-y-3">
            <div
              className="relative h-44 rounded-xl overflow-hidden bg-[#0f0f13] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer"
              onClick={() => !slot.preview && fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              {slot.preview ? (
                <>
                  <img src={slot.preview} alt="" className="w-full h-full object-cover" />
                  {slot.analyzing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                      <p className="text-sm text-slate-300">분석 중...</p>
                    </div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); clearSlot(type) }}
                    className="absolute top-3 right-3 w-7 h-7 bg-black/80 hover:bg-black rounded-full flex items-center justify-center transition-colors border border-white/[0.1]"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                    <Upload className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400 font-medium">드래그하거나 클릭</p>
                    <p className="text-xs text-slate-700 mt-1">PNG · JPG · WEBP</p>
                  </div>
                </div>
              )}
            </div>

            {slot.preview && (
              <div className="relative">
                <textarea
                  value={slot.prompt}
                  onChange={e => useSlotStore.getState().setSlot(type, { prompt: e.target.value })}
                  placeholder="이미지 분석 결과 (직접 수정 가능)..."
                  className={`w-full h-20 resize-none rounded-xl bg-[#0f0f13] border border-white/[0.06] text-sm p-3 pr-9 text-slate-300 placeholder-slate-700 focus:outline-none ${cfg.focus} transition-colors leading-relaxed`}
                />
                {slot.prompt && (
                  <button
                    onClick={() => useSlotStore.getState().setSlot(type, { prompt: '' })}
                    className="absolute top-3 right-3 text-slate-700 hover:text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {slot.error && <p className="text-sm text-red-400 px-1">{slot.error}</p>}
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={slot.prompt}
              onChange={e => useSlotStore.getState().setSlot(type, { prompt: e.target.value })}
              placeholder={cfg.placeholder}
              className={`w-full h-44 resize-none rounded-xl bg-[#0f0f13] border border-white/[0.06] text-sm p-4 pb-10 text-slate-200 placeholder-slate-600 focus:outline-none ${cfg.focus} transition-colors leading-relaxed`}
            />
            <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-700">{cfg.desc}</span>
              <div className="flex items-center gap-2">
                {slot.prompt.length > 0 && (
                  <span className={`text-[11px] tabular-nums ${slot.prompt.length > 300 ? 'text-amber-500' : 'text-slate-700'}`}>
                    {slot.prompt.length}자
                  </span>
                )}
                {slot.prompt.length > 0 && (
                  <button
                    onClick={() => useSlotStore.getState().setSlot(type, { prompt: '' })}
                    className="text-slate-700 hover:text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
