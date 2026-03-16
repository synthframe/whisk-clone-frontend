import { useGenerateStore } from '../../store/generateStore'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { outputBaseURL } from '../../api/client'

export function ResultViewer() {
  const { generating, resultImageUrl, error } = useGenerateStore()

  if (!generating && !resultImageUrl && !error) {
    return (
      <div className="aspect-square border border-dashed border-black/20 flex items-center justify-center">
        <p className="text-black/30 text-xs font-mono uppercase tracking-widest">Generated image will appear here</p>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="aspect-square border border-dashed border-black/20 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-black/50 text-xs font-mono uppercase tracking-widest">Creating your image...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-square border border-dashed border-black/20 flex items-center justify-center p-4">
        <p className="text-black/60 text-sm text-center font-mono">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden aspect-square border border-black/20">
      <img src={`${outputBaseURL}${resultImageUrl}`} alt="Generated" className="w-full h-full object-cover" />
      <a
        href={`${outputBaseURL}${resultImageUrl}`}
        download
        className="absolute bottom-3 right-3 border border-black/20 bg-white text-black text-xs px-3 py-1.5 font-mono uppercase tracking-widest transition-all hover:bg-white hover:text-black"
      >
        Download
      </a>
    </div>
  )
}
