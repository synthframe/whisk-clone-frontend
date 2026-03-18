import { useState } from 'react'
import { ListPlus, Repeat, Play, AlertCircle, Minus, Plus } from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import { useGenerateStore } from '../../store/generateStore'
import { useBatchStore } from '../../store/batchStore'
import { createBatch } from '../../api/batch'
import { RATIO_DIMENSIONS } from '../../types'
import type { BatchJobInput, BatchJobResult, SlotType } from '../../types'

type Mode = 'slot' | 'direct'

function parsePrompts(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\d+\s+/, '').trim())
    .filter((line) => line.length > 0)
}

interface StepperProps {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

function Stepper({ value, min, max, onChange }: StepperProps) {
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
  const jobCount = mode === 'direct' ? directPromptCount : count
  const charCount = promptText.length
  const lineCount = promptText.split('\n').filter((l) => l.trim()).length

  const slotLabels: Record<SlotType, string> = { subject: '주제', scene: '배경', style: '스타일' }
  const slotDots: Record<SlotType, string> = { subject: 'bg-blue-500', scene: 'bg-emerald-500', style: 'bg-violet-500' }

  return (
    <div className="bg-[#141418] rounded-2xl border border-white/[0.08] p-5 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-1">배치 생성</h2>
        <p className="text-xs text-slate-500 mb-4">여러 이미지를 한 번에 생성합니다</p>

        {/* Active Slots Section */}
        <div className="bg-[#1c1c23] rounded-xl border border-white/[0.06] p-3 mb-4">
          <p className="text-xs font-medium text-slate-500 mb-2.5">모든 작업에 적용되는 슬롯</p>
          <div className="flex gap-2">
            {(['subject', 'scene', 'style'] as SlotType[]).map(type => {
              const slot = slots[type]
              return (
                <div key={type} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#141418] border border-white/[0.06] flex items-center justify-center">
                    {slot.preview ? (
                      <img src={slot.preview} className="w-full h-full object-cover" alt={slotLabels[type]} />
                    ) : slot.prompt ? (
                      <p className="text-[9px] text-slate-600 text-center p-1 leading-tight line-clamp-3">{slot.prompt}</p>
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${slotDots[type]} opacity-30`} />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600">{slotLabels[type]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('direct')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              mode === 'direct'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            직접 입력
          </button>
          <button
            onClick={() => setMode('slot')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              mode === 'slot'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
            }`}
          >
            <Repeat className="w-4 h-4" />
            슬롯 반복
          </button>
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      {mode === 'direct' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400">프롬프트 목록</label>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>{charCount}자</span>
              {lineCount > 0 && (
                <span className="font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">{lineCount}줄</span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600">줄바꿈으로 구분, 앞 숫자는 무시됩니다</p>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={`001 Medium shot, a Korean boy...\n003 Wide shot, bright full moon...\n005 Close up, servant face...`}
            rows={8}
            className="w-full bg-[#1c1c23] text-slate-200 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 resize-none placeholder-slate-700 leading-relaxed transition-colors"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">변형 수</label>
            <p className="text-xs text-slate-600 mb-3">현재 슬롯 설정으로 N번 생성합니다</p>
            <Stepper value={count} min={1} max={20} onChange={setCount} />
          </div>
        </div>
      )}

      <div className="h-px bg-white/[0.06]" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">동시 생성 수</p>
            <p className="text-xs text-slate-600 mt-0.5">최대 5개까지 동시 실행</p>
          </div>
          <Stepper value={concurrency} min={1} max={5} onChange={setConcurrency} />
        </div>
      </div>

      {jobCount > 0 && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-violet-400">총 생성 예정</span>
          <span className="text-sm font-bold text-violet-300">{jobCount}개 이미지</span>
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
        disabled={loading || (mode === 'direct' && directPromptCount === 0)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-900/30"
      >
        <Play className="w-4 h-4" />
        {loading
          ? '시작 중...'
          : jobCount > 0
            ? `${jobCount}개 이미지 생성 시작`
            : '배치 실행'}
      </button>
    </div>
  )
}
