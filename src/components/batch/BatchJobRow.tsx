import type { BatchJobResult } from '../../types'
import { outputBaseURL } from '../../api/client'

interface Props {
  job: BatchJobResult
  index: number
}

export function BatchJobRow({ job, index }: Props) {
  const status = job.status || 'pending'

  return (
    <div className="flex items-center gap-3 py-2 border-b border-black/10 last:border-0">
      <span className="text-black/40 text-xs w-6 text-right font-mono">{index + 1}</span>
      <StatusBadge status={status} />
      {job.image_url ? (
        <a href={`${outputBaseURL}${job.image_url}`} target="_blank" rel="noopener noreferrer">
          <img src={`${outputBaseURL}${job.image_url}`} alt={`job-${index}`} className="w-10 h-10 object-cover border border-black/20" />
        </a>
      ) : (
        <div className="w-10 h-10 border border-black/10 flex items-center justify-center">
          <span className="text-black/20 text-xs font-mono">-</span>
        </div>
      )}
      {job.error && <p className="text-black/50 text-xs flex-1 truncate font-mono">{job.error}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'completed'
      ? 'border-black/40 text-black'
      : status === 'failed'
      ? 'border-black/20 text-black/40'
      : 'border-black/10 text-black/30'

  return (
    <span className={`text-xs px-2 py-0.5 border font-mono uppercase tracking-widest whitespace-nowrap ${cls}`}>
      {status}
    </span>
  )
}
