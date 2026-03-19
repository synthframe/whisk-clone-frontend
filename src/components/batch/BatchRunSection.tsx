import { useState } from 'react'
import { Play, AlertCircle, Minus, Plus } from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import { useGenerateStore } from '../../store/generateStore'
import { useBatchStore } from '../../store/batchStore'
import { createBatch } from '../../api/batch'
import { RATIO_DIMENSIONS } from '../../types'
import type { BatchJobInput, BatchJobResult } from '../../types'

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 hover:border-violet-500/40 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-slate-200 tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 hover:border-violet-500/40 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function parsePrompts(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\d+\s+/, '').trim())
    .filter((line) => line.length > 0)
}

export function BatchRunSection() {
  const slots = useSlotStore((s) => s.slots)
  const selectedPreset = useGenerateStore((s) => s.selectedPreset)
  const selectedRatio = useGenerateStore((s) => s.selectedRatio)
  const { batchMode, batchCount, batchConcurrency, batchPromptText, setBatchConcurrency, addJob } = useBatchStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const directPromptCount = parsePrompts(batchPromptText).length
  const jobCount = batchMode === 'direct' ? directPromptCount : batchCount

  const submitBatch = async () => {
    setLoading(true)
    setError(null)
    try {
      let jobs: BatchJobInput[]
      if (batchMode === 'direct') {
        const prompts = parsePrompts(batchPromptText)
        if (prompts.length === 0) {
          setError('프롬프트를 입력해주세요')
          setLoading(false)
          return
        }
        const { width, height } = RATIO_DIMENSIONS[selectedRatio]
        jobs = prompts.map((p) => ({
          subject_prompt: p,
          scene_prompt: slots.scene.prompt,
          style_prompt: slots.style.prompt,
          style_preset: selectedPreset,
          width,
          height,
        }))
      } else {
        const { width, height } = RATIO_DIMENSIONS[selectedRatio]
        const baseJob: BatchJobInput = {
          subject_prompt: slots.subject.prompt,
          scene_prompt: slots.scene.prompt,
          style_prompt: slots.style.prompt,
          style_preset: selectedPreset,
          width,
          height,
        }
        jobs = Array.from({ length: batchCount }, () => ({ ...baseJob }))
      }
      const res = await createBatch({ jobs, concurrency: batchConcurrency })
      addJob({
        batchId: res.batch_id,
        total: res.total,
        status: 'running',
        results: Array.from({ length: res.total }, (_, i) => ({ index: i, status: '' } as BatchJobResult)),
        events: [],
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Batch creation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#141418] rounded-2xl border border-white/[0.07] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-300">동시 생성 수</p>
            <p className="text-sm text-slate-500 mt-0.5">최대 5개까지 동시 실행</p>
          </div>
          <Stepper value={batchConcurrency} min={1} max={5} onChange={setBatchConcurrency} />
        </div>

        {jobCount > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-violet-400">총 생성 예정</span>
            <span className="text-base font-bold text-violet-300">{jobCount}개 이미지</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={submitBatch}
          disabled={loading || (batchMode === 'direct' && directPromptCount === 0)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-violet-900/30"
        >
          <Play className="w-5 h-5" />
          {loading
            ? '시작 중...'
            : jobCount > 0
              ? `${jobCount}개 이미지 생성 시작`
              : '배치 실행'}
        </button>
      </div>
    </div>
  )
}
