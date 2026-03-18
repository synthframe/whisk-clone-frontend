import { useState } from 'react'
import { SlotGrid } from './components/slots/SlotGrid'
import { StylePresets } from './components/styles/StylePresets'
import { GenerateButton } from './components/generate/GenerateButton'
import { ResultViewer } from './components/generate/ResultViewer'
import { BatchPanel } from './components/batch/BatchPanel'
import { useGenerateStore } from './store/generateStore'
import { ErrorToast } from './components/shared/ErrorToast'
import type { AspectRatio } from './types'

const RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4']

type Mode = 'single' | 'batch'

export default function App() {
  const [mode, setMode] = useState<Mode>('single')
  const { error, setError, selectedRatio, setRatio } = useGenerateStore()

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b-2 border-black px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 border-2 border-black flex items-center justify-center">
            <span className="text-black font-bold text-base font-mono">W</span>
          </div>
          <h1 className="text-xl font-bold text-black font-mono tracking-widest uppercase">Whisk Clone</h1>
        </div>
        <div className="flex border-2 border-black">
          {(['single', 'batch'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2 text-sm font-mono font-bold transition-all tracking-widest uppercase
                ${mode === m ? 'bg-black text-white' : 'text-black hover:bg-black hover:text-white'}`}
            >
              {m === 'single' ? 'Single' : 'Batch'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <section className="mb-10">
          <h2 className="text-sm font-mono font-bold text-black/60 uppercase tracking-widest mb-6">Compose Your Image</h2>
          <SlotGrid />
        </section>

        <div className="border-t-2 border-black mb-10" />

        <section className="mb-10">
          <h2 className="text-sm font-mono font-bold text-black/60 uppercase tracking-widest mb-6">Style Preset</h2>
          <StylePresets />
        </section>

        <div className="border-t-2 border-black mb-10" />

        <section className="mb-10">
          <h2 className="text-sm font-mono font-bold text-black/60 uppercase tracking-widest mb-4">Aspect Ratio</h2>
          <div className="flex gap-2">
            {RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                className={`px-4 py-2 text-sm font-mono font-bold border-2 transition-all uppercase tracking-widest
                  ${selectedRatio === r ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        <div className="border-t-2 border-black mb-10" />

        {mode === 'single' ? (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <GenerateButton />
              <p className="text-black/40 text-xs text-center font-mono tracking-wider">Cloudflare Workers AI · SDXL-Lightning</p>
            </div>
            <ResultViewer />
          </div>
        ) : (
          <BatchPanel />
        )}
      </main>

      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </div>
  )
}
