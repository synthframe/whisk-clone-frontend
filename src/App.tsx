import { useState } from 'react'
import { SlotGrid } from './components/slots/SlotGrid'
import { StylePresets } from './components/styles/StylePresets'
import { GenerateButton } from './components/generate/GenerateButton'
import { ResultViewer } from './components/generate/ResultViewer'
import { BatchPanel } from './components/batch/BatchPanel'
import { useGenerateStore } from './store/generateStore'
import { ErrorToast } from './components/shared/ErrorToast'

type Mode = 'single' | 'batch'

export default function App() {
  const [mode, setMode] = useState<Mode>('single')
  const { error, setError } = useGenerateStore()

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-black/20 flex items-center justify-center">
            <span className="text-black font-bold text-sm font-mono">W</span>
          </div>
          <h1 className="text-lg font-bold text-black font-mono tracking-widest uppercase">Whisk Clone</h1>
        </div>
        <div className="flex items-center border border-black/20 p-1">
          {(['single', 'batch'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm font-mono font-medium transition-all tracking-widest uppercase
                ${mode === m ? 'bg-black text-black' : 'text-black/60 hover:bg-white hover:text-black'}`}
            >
              {m === 'single' ? 'Single' : 'Batch'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="mb-8">
          <h2 className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4">Compose Your Image</h2>
          <SlotGrid />
        </section>

        <div className="border-t border-black/10 mb-8" />

        <section className="mb-8">
          <h2 className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4">Style Preset</h2>
          <StylePresets />
        </section>

        <div className="border-t border-black/10 mb-8" />

        {mode === 'single' ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <GenerateButton />
              <p className="text-black/20 text-xs text-center font-mono">Cloudflare Workers AI · SDXL-Lightning</p>
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
