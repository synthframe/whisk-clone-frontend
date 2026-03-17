import { useState } from 'react'
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

  return (
    <div className="border-2 border-black p-5 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <span className="text-sm text-black/50 font-mono tracking-widest font-bold">{batchId.slice(0, 8)}...</span>
        <div className="flex items-center gap-3">
          {job.status === 'completed' && completedUrls.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="text-xs px-3 py-1 border-2 border-black font-mono uppercase tracking-widest font-bold transition-all hover:bg-black hover:text-white disabled:opacity-40"
            >
              {downloading ? '...' : `ZIP (${completedUrls.length})`}
            </button>
          )}
          <span className={`text-xs px-3 py-1 border-2 font-mono uppercase tracking-widest font-bold ${
            job.status === 'completed' ? 'bg-black text-white border-black' : 'border-black text-black'
          }`}>
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
    return <p className="text-black/40 text-sm text-center py-10 font-mono uppercase tracking-widest font-bold">No batch jobs yet</p>
  }

  return (
    <div className="space-y-4 max-h-[32rem] overflow-y-auto">
      {jobs.map((j) => (
        <BatchQueueItem key={j.batchId} batchId={j.batchId} />
      ))}
    </div>
  )
}
