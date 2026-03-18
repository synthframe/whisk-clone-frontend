import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'border-emerald-500/20 bg-[#1c1c23]/90 text-emerald-400',
  error: 'border-red-500/20 bg-[#1c1c23]/90 text-red-400',
  info: 'border-blue-500/20 bg-[#1c1c23]/90 text-blue-400',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 border rounded-xl shadow-2xl shadow-black/50 px-4 py-3 max-w-sm pointer-events-auto backdrop-blur-xl
              animate-slide-in
              ${STYLES[toast.type]}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium flex-1 text-slate-200">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-600 hover:text-slate-400 transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
