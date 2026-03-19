import { Wand2 } from 'lucide-react'
import { useGenerateStore } from '../../store/generateStore'
import { useSlotStore } from '../../store/slotStore'
import { useGenerate } from '../../hooks/useGenerate'

export function GenerateButton() {
  const { generating, mainPrompt } = useGenerateStore()
  const slots = useSlotStore(s => s.slots)
  const { generate } = useGenerate()

  const hasContent = mainPrompt.trim() || slots.subject.prompt || slots.scene.prompt || slots.style.prompt

  return (
    <button
      onClick={generate}
      disabled={generating}
      className={`w-full flex items-center justify-center gap-3 text-white font-bold py-5 rounded-2xl text-base transition-all ${
        generating
          ? 'bg-violet-700/60 cursor-not-allowed shadow-none'
          : 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 active:scale-[0.99]'
      }`}
    >
      {generating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          이미지 생성 중...
        </>
      ) : (
        <>
          <Wand2 className="w-5 h-5" />
          {hasContent ? '이미지 생성' : '프롬프트를 입력하세요'}
        </>
      )}
    </button>
  )
}
