import type { BatchJobResult } from '../../types'
import { outputBaseURL } from '../../api/client'

interface Props {
  job: BatchJobResult
  index: number
}

export function BatchJobRow({ job, index }: Props) {
  const status = job.status || 'pending'

  return (
    <div className="flex items-center gap-4 py-3 border-b-2 border-black last:border-0">
      <span className="text-black/40 text-sm w-6 text-right font-mono font-bold">{index + 1}</span>
      <StatusBadge status={status} />
      {job.image_url ? (
        <a href={`${outputBaseURL}${job.image_url}?t=${Date.now()}`} target="_blank" rel="noopener noreferrer">
          <img src={`${outputBaseURL}${job.image_url}?t=${Date.now()}`} alt={`job-${index}`} className="w-12 h-12 object-cover border-2 border-black" />
        </a>
      ) : (
        <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
          <span className="text-black/30 text-sm font-mono font-bold">—</span>
        </div>
      )}
      {job.error && <p className="text-black/60 text-sm flex-1 truncate font-mono">{job.error}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'completed' ? 'border-black text-black bg-black text-white' :
    status === 'failed' ? 'border-black text-black/50' :
    'border-black/30 text-black/30'

  return (
    <span className={`text-xs px-3 py-1 border-2 font-mono uppercase tracking-widest whitespace-nowrap font-bold ${cls}`}>
      {status}
    </span>
  )
}
