interface Props {
  message: string
  onClose: () => void
}

export function ErrorToast({ message, onClose }: Props) {
  return (
    <div className="fixed bottom-4 right-4 border border-black/20 bg-white text-black px-4 py-3 flex items-center gap-3 z-50 max-w-sm">
      <span className="flex-1 text-sm font-mono">{message}</span>
      <button onClick={onClose} className="text-black/60 hover:text-black text-lg leading-none font-mono transition-colors">
        ×
      </button>
    </div>
  )
}
