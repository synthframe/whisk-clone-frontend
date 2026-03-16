import { useState } from 'react'
import { useSlotStore } from '../../store/slotStore'
import { useGenerateStore } from '../../store/generateStore'
import { useBatchStore } from '../../store/batchStore'
import { createBatch } from '../../api/batch'
import { BatchQueue } from './BatchQueue'
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
        jobs = prompts.map((p) => ({
          subject_prompt: p,
          scene_prompt: '',
          style_prompt: '',
          style_preset: '',
        }))
      } else {
        const baseJob: BatchJobInput = {
          subject_prompt: slots.subject.prompt,
          scene_prompt: slots.scene.prompt,
          style_prompt: slots.style.prompt,
          style_preset: selectedPreset,
        }
        jobs = Array.from({ length: count }, () => ({ ...baseJob }))
      }

      const res = await createBatch({ jobs, concurrency })
      addJob({
        batchId: res.batch_id,
        total: res.total,
        status: 'running',
        results: Array.from({ length: res.total }, (_, i) => ({
          index: i,
          status: '',
        } as BatchJobResult)),
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
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center bg-white/10 rounded-lg p-1 w-fit">
          <button
            onClick={() => setMode('direct')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'direct' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
            }`}
          >
            직접 입력
          </button>
          <button
            onClick={() => setMode('slot')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'slot' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
            }`}
          >
            슬롯 반복
          </button>
        </div>

        {mode === 'direct' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">프롬프트 목록 (줄바꿈으로 구분, 앞 번호 자동 제거)</span>
              {directPromptCount > 0 && (
                <span className="text-purple-400 text-xs">{directPromptCount}개</span>
              )}
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={`001 Medium shot, a Korean boy...\n003 Wide shot, bright full moon...\n005 Close up, servant face...`}
              rows={8}
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-xs font-mono
                focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none
                placeholder:text-white/20"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-white/50 text-xs">Variations</span>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-white/50 text-xs">Concurrency</span>
              <input
                type="number"
                min={1}
                max={5}
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </label>
          </div>
        )}

        {mode === 'direct' && (
          <label className="flex items-center gap-2">
            <span className="text-white/50 text-xs">동시 생성</span>
            <input
              type="number"
              min={1}
              max={5}
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-16 bg-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </label>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          onClick={submitBatch}
          disabled={loading || (mode === 'direct' && directPromptCount === 0)}
          className="w-full py-2 rounded-lg font-medium text-sm text-white transition-all
            bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? '시작 중...'
            : mode === 'direct'
            ? `${directPromptCount}개 프롬프트 생성`
            : `${count}개 배치 실행`}
        </button>
      </div>
      <BatchQueue />
    </div>
  )
}
