import { Download, RefreshCw, ImageIcon } from 'lucide-react'
import { useGenerateStore } from '../../store/generateStore'
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
  const addToast = useToastStore((s) => s.addToast)
  const { generate } = useGenerate()

  const handleDownload = async () => {
    if (!resultImageUrl) return
    await downloadImage(resultImageUrl, 'whisk.png')
    addToast('다운로드 완료', 'success')
  }

  if (!generating && !resultImageUrl && !error) {
    return (
      <div className="aspect-square rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#1c1c23] flex items-center justify-center">
          <ImageIcon className="w-7 h-7 text-slate-700" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">생성된 이미지가 여기에 표시됩니다</p>
          <p className="text-xs text-slate-700 mt-1">슬롯을 설정하고 생성 버튼을 눌러보세요</p>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="aspect-square rounded-2xl bg-[#141418] border border-violet-500/20 flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-violet-500/10 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-300">이미지 생성 중...</p>
          <p className="text-xs text-slate-600 mt-1">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-square rounded-2xl bg-[#141418] border border-red-500/20 flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm text-red-400 text-center">{error}</p>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square rounded-2xl overflow-hidden group animate-fade-in"
      >
        <img
          src={`${outputBaseURL}${resultImageUrl}?t=${resultTs}`}
          alt="Generated"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
        <button
          onClick={handleDownload}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 border border-white/[0.08]"
        >
          <Download className="w-3.5 h-3.5" />
          다운로드
        </button>
      </div>

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
