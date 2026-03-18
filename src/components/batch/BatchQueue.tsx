import { useState } from 'react'
import { Archive } from 'lucide-react'
import JSZip from 'jszip'
import { useBatchStore } from '../../store/batchStore'
import { useBatchSSE } from '../../hooks/useBatchSSE'
import { BatchProgress } from './BatchProgress'
import { BatchJobRow } from './BatchJobRow'
import { outputBaseURL } from '../../api/client'

async function downloadAllAsZip(imageUrls: string[], batchId: string) {
  const zip = new JSZip()
  await Promise.all(
    imageUrls.map(async (url, i) => {
      try {
        const res = await fetch(`${outputBaseURL}${url}`)
        if (!res.ok) return
        const blob = await res.blob()
        zip.file(`image_${String(i + 1).padStart(3, '0')}.png`, blob)
      } catch {
        // skip failed
      }
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  const blobUrl = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `batch_${batchId.slice(0, 8)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

interface Props {
  batchId: string
}

function BatchQueueItem({ batchId }: Props) {
  useBatchSSE(batchId)
  const job = useBatchStore((s) => s.jobs.find((j) => j.batchId === batchId))
  const [downloading, setDownloading] = useState(false)
  if (!job) return null

  const completed = job.results.filter((r) => r.status === 'completed').length
  const failed = job.results.filter((r) => r.status === 'failed').length
  const completedUrls = job.results.filter(r => r.status === 'completed' && r.image_url).map(r => r.image_url!)

  const handleDownloadAll = async () => {
    setDownloading(true)
    await downloadAllAsZip(completedUrls, batchId).catch(() => {})
    setDownloading(false)
  }

  const statusCls =
    job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    job.status === 'running' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
    'bg-white/[0.04] text-slate-500 border-white/[0.08]'

  return (
    <div className="bg-[#141418] rounded-2xl border border-white/[0.08] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 font-mono">{batchId.slice(0, 8)}...</span>
        <div className="flex items-center gap-2">
          {job.status === 'completed' && completedUrls.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1c1c23] border border-white/[0.08] text-slate-400 hover:border-violet-500/40 hover:text-slate-200 transition-colors disabled:opacity-40 font-medium"
            >
              <Archive className="w-3.5 h-3.5" />
              {downloading ? '...' : `ZIP (${completedUrls.length})`}
            </button>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${statusCls}`}>
            {job.status}
          </span>
        </div>
      </div>
      <BatchProgress completed={completed} failed={failed} total={job.total} />
      <div>
        {job.results.map((result, i) => (
          <BatchJobRow key={i} job={result} index={i} />
        ))}
      </div>
    </div>
  )
}

export function BatchQueue() {
  const jobs = useBatchStore((s) => s.jobs)

  if (jobs.length === 0) {
    return (
      <div className="h-64 rounded-2xl bg-[#141418] border border-white/[0.08] flex items-center justify-center">
        <p className="text-sm text-slate-600">배치 작업이 여기에 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[32rem] overflow-y-auto">
      {jobs.map((j) => (
        <BatchQueueItem key={j.batchId} batchId={j.batchId} />
      ))}
    </div>
  )
}
