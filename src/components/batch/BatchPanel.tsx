import { useState } from 'react'
import { useSlotStore } from '../../store/slotStore'
import { useGenerateStore } from '../../store/generateStore'
import { useBatchStore } from '../../store/batchStore'
import { createBatch } from '../../api/batch'
import { BatchQueue } from './BatchQueue'
import { RATIO_DIMENSIONS } from '../../types'
import type { BatchJobInput, BatchJobResult } from '../../types'

type Mode = 'slot' | 'direct'

function parsePrompts(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\d+\s+/, '').trim())
    .filter((line) => line.length > 0)
}

export function BatchPanel() {
  const slots = useSlotStore((s) => s.slots)
  const selectedPreset = useGenerateStore((s) => s.selectedPreset)
  const selectedRatio = useGenerateStore((s) => s.selectedRatio)
  const addJob = useBatchStore((s) => s.addJob)
  const [mode, setMode] = useState<Mode>('direct')
  const [count, setCount] = useState(3)
  const [concurrency, setConcurrency] = useState(2)
  const [promptText, setPromptText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitBatch = async () => {
    setLoading(true)
    setError(null)
    try {
      let jobs: BatchJobInput[]
      if (mode === 'direct') {
        const prompts = parsePrompts(promptText)
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
        jobs = Array.from({ length: count }, () => ({ ...baseJob }))
      }
      const res = await createBatch({ jobs, concurrency })
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

  const directPromptCount = parsePrompts(promptText).length

  return (
    <div className="space-y-6">
      <div className="border-2 border-black p-6 space-y-5">
        <div className="flex border-2 border-black w-fit">
          <button
            onClick={() => setMode('direct')}
            className={`px-4 py-2 text-sm font-mono font-bold transition-all uppercase tracking-widest ${
              mode === 'direct' ? 'bg-black text-white' : 'text-black hover:bg-black hover:text-white'
            }`}
          >
            직접 입력
          </button>
          <button
            onClick={() => setMode('slot')}
            className={`px-4 py-2 text-sm font-mono font-bold transition-all uppercase tracking-widest ${
              mode === 'slot' ? 'bg-black text-white' : 'text-black hover:bg-black hover:text-white'
            }`}
          >
            슬롯 반복
          </button>
        </div>

        {mode === 'direct' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-black/60 text-sm font-mono font-bold">프롬프트 목록 (줄바꿈으로 구분, 앞 번호 자동 제거)</span>
              {directPromptCount > 0 && (
                <span className="text-black font-mono font-bold text-sm">{directPromptCount}개</span>
              )}
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={`001 Medium shot, a Korean boy...\n003 Wide shot, bright full moon...\n005 Close up, servant face...`}
              rows={8}
              className="w-full bg-white text-black border-2 border-black px-4 py-3 text-sm font-mono
                focus:outline-none resize-none placeholder:text-black/30 transition-colors"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-black/60 text-sm font-mono font-bold uppercase tracking-widest">Variations</span>
              <input
                type="number" min={1} max={20} value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-white text-black border-2 border-black px-4 py-3 text-sm font-mono font-bold focus:outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-black/60 text-sm font-mono font-bold uppercase tracking-widest">Concurrency</span>
              <input
                type="number" min={1} max={5} value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full bg-white text-black border-2 border-black px-4 py-3 text-sm font-mono font-bold focus:outline-none"
              />
            </label>
          </div>
        )}

        {mode === 'direct' && (
          <label className="flex items-center gap-4">
            <span className="text-black/60 text-sm font-mono font-bold uppercase tracking-widest">동시 생성</span>
            <input
              type="number" min={1} max={5} value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-20 bg-white text-black border-2 border-black px-3 py-2 text-sm font-mono font-bold focus:outline-none"
            />
          </label>
        )}

        {error && <p className="text-black font-mono font-bold text-sm">{error}</p>}

        <button
          onClick={submitBatch}
          disabled={loading || (mode === 'direct' && directPromptCount === 0)}
          className="w-full py-4 border-2 border-black font-mono font-bold text-base text-black transition-all
            hover:bg-black hover:text-white uppercase tracking-widest
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? '시작 중...' : mode === 'direct' ? `${directPromptCount}개 프롬프트 생성` : `${count}개 배치 실행`}
        </button>
      </div>
      <BatchQueue />
    </div>
  )
}
