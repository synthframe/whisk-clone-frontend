import { useEffect } from 'react'
import JSZip from 'jszip'
import { useBatchStore } from '../store/batchStore'
import { outputBaseURL } from '../api/client'
import type { SSEEvent, BatchJobResult } from '../types'

async function downloadAllAsZip(imageUrls: string[], batchId: string) {
  const zip = new JSZip()
  await Promise.all(
    imageUrls.map(async (url, i) => {
      const res = await fetch(`${outputBaseURL}${url}`)
      const blob = await res.blob()
      zip.file(`image_${String(i + 1).padStart(3, '0')}.png`, blob)
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(content)
  a.download = `batch_${batchId.slice(0, 8)}.zip`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function useBatchSSE(batchId: string | null) {
  const updateJob = useBatchStore((s) => s.updateJob)
  const appendEvent = useBatchStore((s) => s.appendEvent)

  useEffect(() => {
    if (!batchId) return

    const es = new EventSource(`${outputBaseURL}/api/batch/${batchId}/stream`)

    es.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data)
        appendEvent(batchId, event.type)

        if (event.type === 'job_completed') {
          const payload = event.payload as { index: number; image_url: string }
          updateJob(batchId, {
            results: useBatchStore.getState().jobs.find(j => j.batchId === batchId)?.results.map((r, i) =>
              i === payload.index
                ? ({ index: i, status: 'completed', image_url: payload.image_url } as BatchJobResult)
                : r
            ) ?? [],
          })
        } else if (event.type === 'job_failed') {
          const payload = event.payload as { index: number; error: string }
          updateJob(batchId, {
            results: useBatchStore.getState().jobs.find(j => j.batchId === batchId)?.results.map((r, i) =>
              i === payload.index
                ? ({ index: i, status: 'failed', error: payload.error } as BatchJobResult)
                : r
            ) ?? [],
          })
        } else if (event.type === 'batch_completed') {
          updateJob(batchId, { status: 'completed' })
          es.close()
          const completedResults = useBatchStore.getState().jobs
            .find(j => j.batchId === batchId)?.results
            .filter(r => r.status === 'completed' && r.image_url)
            .map(r => r.image_url!) ?? []
          if (completedResults.length > 0) {
            downloadAllAsZip(completedResults, batchId)
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
    }

    return () => es.close()
  }, [batchId, updateJob, appendEvent])
}
