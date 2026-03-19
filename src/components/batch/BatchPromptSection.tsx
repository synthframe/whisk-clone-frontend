import { ListPlus, Repeat, Minus, Plus } from 'lucide-react'
import { useBatchStore } from '../../store/batchStore'

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

export function BatchPromptSection() {
  const { batchMode, batchCount, batchPromptText, setBatchMode, setBatchCount, setBatchPromptText } = useBatchStore()

  const charCount = batchPromptText.length
  const lineCount = batchPromptText.split('\n').filter((l) => l.trim()).length

  return (
    <div className="bg-[#141418] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
        <p className="text-base font-bold text-slate-200">배치 프롬프트</p>
        <span className="ml-auto text-xs text-slate-500">생성할 이미지의 주제를 입력합니다</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setBatchMode('direct')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              batchMode === 'direct'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            직접 입력
          </button>
          <button
            onClick={() => setBatchMode('slot')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              batchMode === 'slot'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                : 'bg-transparent text-slate-500 border-white/[0.08] hover:border-white/[0.18] hover:text-slate-300'
            }`}
          >
            <Repeat className="w-4 h-4" />
            슬롯 반복
          </button>
        </div>

        {/* Content */}
        {batchMode === 'direct' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-300">프롬프트 목록</label>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{charCount}자</span>
                {lineCount > 0 && (
                  <span className="font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">{lineCount}줄</span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500">줄바꿈으로 구분, 앞 숫자는 무시됩니다</p>
            <textarea
              value={batchPromptText}
              onChange={(e) => setBatchPromptText(e.target.value)}
              placeholder={`001 Medium shot, a Korean boy...\n003 Wide shot, bright full moon...\n005 Close up, servant face...`}
              rows={8}
              className="w-full bg-[#1c1c23] text-slate-100 border border-white/[0.06] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-violet-500/50 resize-none placeholder-slate-500 leading-relaxed transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">변형 수</label>
            <p className="text-sm text-slate-500">현재 슬롯 설정으로 N번 생성합니다</p>
            <Stepper value={batchCount} min={1} max={20} onChange={setBatchCount} />
          </div>
        )}
      </div>
    </div>
  )
}
