interface Props {
  completed: number
  failed: number
  total: number
}

export function BatchProgress({ completed, failed, total }: Props) {
  const pct = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{completed} 완료 · {failed} 실패</span>
        <span className="font-medium text-slate-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full flex">
          <div className="bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
          <div className="bg-red-500/60 transition-all duration-300" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
        </div>
      </div>
    </div>
  )
}
