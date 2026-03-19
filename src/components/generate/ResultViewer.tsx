import { Download, RefreshCw, ImageIcon } from 'lucide-react'
import { useGenerateStore } from '../../store/generateStore'
import { useSlotStore } from '../../store/slotStore'
import { useToastStore } from '../../store/toastStore'
import { useGenerate } from '../../hooks/useGenerate'
import { outputBaseURL } from '../../api/client'

async function downloadImage(imageUrl: string, filename: string) {
  const res = await fetch(`${outputBaseURL}${imageUrl}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ResultViewer() {
  const { generating, resultImageUrl, resultTs, error } = useGenerateStore()
  const slots = useSlotStore(s => s.slots)
  const addToast = useToastStore((s) => s.addToast)
  const { generate } = useGenerate()

  const handleDownload = async () => {
    if (!resultImageUrl) return
    await downloadImage(resultImageUrl, 'whisk.png')
    addToast('다운로드 완료', 'success')
  }

  if (!generating && !resultImageUrl && !error) {
    return (
      <div className="min-h-[340px] lg:min-h-[520px] rounded-2xl bg-[#141418] border border-white/[0.06] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#0f0f13] border border-white/[0.06] flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-700" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-400">결과가 여기에 표시됩니다</p>
          <p className="text-xs text-slate-600">슬롯에 내용을 입력하고 생성 버튼을 누르세요</p>
        </div>
        <div className="mt-2 flex flex-col gap-2 w-full max-w-[180px]">
          {(['subject', 'scene', 'style'] as const).map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                type === 'subject' ? 'bg-blue-500' : type === 'scene' ? 'bg-emerald-500' : 'bg-violet-500'
              }`} />
              <div className="flex-1 h-px bg-white/[0.04] rounded" />
              <span className="text-[10px] text-slate-700">
                {type === 'subject' ? '주제' : type === 'scene' ? '배경' : '스타일'}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="min-h-[340px] lg:min-h-[520px] rounded-2xl bg-[#141418] border border-violet-500/20 flex flex-col items-center justify-center gap-5">
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-violet-500/10 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">이미지 생성 중...</p>
          <p className="text-xs text-slate-600 mt-1">FLUX.1 모델이 이미지를 그리고 있습니다</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[340px] lg:min-h-[520px] rounded-2xl bg-[#141418] border border-red-500/20 flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">생성 실패</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </button>
      </div>
    )
  }

  const hasPrompts = slots.subject.prompt || slots.scene.prompt || slots.style.prompt

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden group animate-fade-in bg-[#141418]">
        <img
          src={`${outputBaseURL}${resultImageUrl}?t=${resultTs}`}
          alt="Generated"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm hover:bg-black text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-white/[0.1] shadow-lg"
        >
          <Download className="w-3.5 h-3.5" />
          다운로드
        </button>
      </div>

      {hasPrompts && (
        <div className="bg-[#141418] rounded-xl border border-white/[0.06] px-3.5 py-3 space-y-1.5">
          {slots.subject.prompt && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{slots.subject.prompt}</p>
            </div>
          )}
          {slots.scene.prompt && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{slots.scene.prompt}</p>
            </div>
          )}
          {slots.style.prompt && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{slots.style.prompt}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={generate}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/[0.08] hover:border-white/[0.18] text-slate-400 hover:text-slate-200 text-sm font-medium py-2.5 rounded-xl transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        다시 생성
      </button>
    </div>
  )
}
