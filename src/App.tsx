import { useState } from 'react'
import { Navbar } from './components/shared/Navbar'
import { SlotGrid } from './components/slots/SlotGrid'
import { StylePresets } from './components/styles/StylePresets'
import { GenerateButton } from './components/generate/GenerateButton'
import { ResultViewer } from './components/generate/ResultViewer'
import { BatchPanel } from './components/batch/BatchPanel'
import { BatchQueue } from './components/batch/BatchQueue'
import { GalleryPanel } from './components/gallery/GalleryPanel'
import { ToastContainer } from './components/shared/Toast'
import { useGenerateStore } from './store/generateStore'
import { useBatchStore } from './store/batchStore'
import { Layers } from 'lucide-react'
import type { AspectRatio } from './types'

const RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4']

export default function App() {
  const [mode, setMode] = useState<'single' | 'batch' | 'gallery'>('single')
  const { selectedRatio, setRatio } = useGenerateStore()
  const { jobs } = useBatchStore()

  return (
    <div className="min-h-screen bg-[#0c0c0f]">
      <Navbar mode={mode} onModeChange={setMode} />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {mode === 'single' && (
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left: input flow */}
            <div className="space-y-4">
              <SlotGrid />

              {/* Controls card: style + ratio combined */}
              <div className="bg-[#141418] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06]">
                {/* Style presets */}
                <div className="p-4">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">스타일</p>
                  <StylePresets />
                </div>

                {/* Aspect ratio */}
                <div className="p-4">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">비율</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RATIOS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRatio(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedRatio === r
                            ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                            : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <GenerateButton />
            </div>

            {/* Right: result — sticky, fills available height */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <ResultViewer />
            </div>
          </div>
        )}

        {mode === 'batch' && (
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Left: slots + controls + queue — same width as single mode */}
            <div className="space-y-4">
              <SlotGrid />

              <div className="bg-[#141418] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06]">
                <div className="p-4">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">스타일</p>
                  <StylePresets />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">비율</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RATIOS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRatio(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedRatio === r
                            ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                            : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {jobs.length > 0 ? (
                <BatchQueue />
              ) : (
                <div className="h-48 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1c1c23] border border-white/[0.06] flex items-center justify-center">
                    <Layers className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">배치 작업이 여기에 표시됩니다</p>
                    <p className="text-xs text-slate-600 mt-1">우측에서 배치를 시작하세요</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: batch panel — sticky like ResultViewer */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <BatchPanel />
            </div>
          </div>
        )}

        {mode === 'gallery' && (
          <GalleryPanel />
        )}
      </main>

      <ToastContainer />
    </div>
  )
}
