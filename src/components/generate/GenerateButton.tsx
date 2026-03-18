import { Wand2 } from 'lucide-react'
import { useGenerateStore } from '../../store/generateStore'
import { useGenerate } from '../../hooks/useGenerate'

export function GenerateButton() {
  const { generating } = useGenerateStore()
  const { generate } = useGenerate()

  return (
    <button
      onClick={generate}
      disabled={generating}
      className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50"
    >
      {generating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4" />
          이미지 생성
        </>
      )}
    </button>
  )
}
