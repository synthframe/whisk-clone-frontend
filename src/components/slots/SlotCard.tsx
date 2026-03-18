import { useRef } from 'react'
import { Upload, Type, X, Loader2, Image as ImageIcon } from 'lucide-react'
import type { SlotType } from '../../types'
import { useSlotStore } from '../../store/slotStore'
import { useSlotUpload } from '../../hooks/useSlotUpload'

const SLOT_CONFIG = {
  subject: { label: '주제', desc: '인물 · 사물 · 동물', color: 'from-blue-600/20 to-cyan-600/20', dot: 'bg-blue-500' },
  scene: { label: '배경', desc: '장소 · 환경 · 공간', color: 'from-emerald-600/20 to-teal-600/20', dot: 'bg-emerald-500' },
  style: { label: '스타일', desc: '화풍 · 색감 · 조명', color: 'from-violet-600/20 to-purple-600/20', dot: 'bg-violet-500' },
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

  return (
    <div className="rounded-2xl bg-[#141418] border border-white/[0.08] overflow-hidden group hover:border-white/[0.14] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <div>
            <p className="text-sm font-semibold text-slate-100">{cfg.label}</p>
            <p className="text-xs text-slate-600">{cfg.desc}</p>
          </div>
        </div>
        <div className="flex bg-[#1c1c23] rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => onModeChange('image')}
            className={`p-1.5 rounded-md transition-all ${inputMode === 'image' ? 'bg-white/[0.1] text-slate-200' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <ImageIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => onModeChange('text')}
            className={`p-1.5 rounded-md transition-all ${inputMode === 'text' ? 'bg-white/[0.1] text-slate-200' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Type className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {inputMode === 'image' ? (
          <div
            className="relative aspect-square rounded-xl overflow-hidden bg-[#1c1c23] border border-white/[0.06] hover:border-violet-500/40 transition-all cursor-pointer"
            onClick={() => !slot.preview && fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {slot.preview ? (
              <>
                <img src={slot.preview} alt="" className="w-full h-full object-cover" />
                {slot.analyzing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                    <div className="skeleton absolute inset-0 opacity-30" />
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin relative z-10" />
                    <p className="text-xs text-slate-300 relative z-10">분석 중...</p>
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); clearSlot(type) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group/upload">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center transition-transform group-hover/upload:scale-105`}>
                  <Upload className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-600">드래그하거나 클릭</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={slot.prompt}
            onChange={e => useSlotStore.getState().setSlot(type, { prompt: e.target.value })}
            placeholder={`${cfg.label} 설명...`}
            className="w-full aspect-square resize-none rounded-xl bg-[#1c1c23] border border-white/[0.06] text-sm p-3 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors leading-relaxed"
          />
        )}

        {slot.prompt && inputMode === 'image' && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed px-0.5">{slot.prompt}</p>
        )}
        {slot.error && <p className="mt-2 text-xs text-red-400 px-0.5">{slot.error}</p>}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  )
}
