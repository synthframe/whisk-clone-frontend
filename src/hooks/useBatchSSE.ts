import { useEffect } from 'react'
import JSZip from 'jszip'
import { useBatchStore } from '../store/batchStore'
import { outputBaseURL } from '../api/client'
import type { SSEEvent, BatchJobResult } from '../types'

async function downloadAllAsZip(imageUrls: string[], batchId: string) {
  console.log('[zip] starting download, urls:', imageUrls)
  const zip = new JSZip()
  await Promise.all(
    imageUrls.map(async (url, i) => {
      try {
        const fullUrl = `${outputBaseURL}${url}`
        console.log('[zip] fetching', fullUrl)
        const res = await fetch(fullUrl)
        if (!res.ok) {
          console.error('[zip] fetch failed', res.status, fullUrl)
          return
        }
        const blob = await res.blob()
        console.log('[zip] fetched blob size', blob.size, 'for', url)
        zip.file(`image_${String(i + 1).padStart(3, '0')}.png`, blob)
      } catch (e) {
        console.error('[zip] fetch error for', url, e)
      }
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  console.log('[zip] zip size', content.size)
  const blobUrl = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `batch_${batchId.slice(0, 8)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
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
          const allResults = useBatchStore.getState().jobs.find(j => j.batchId === batchId)?.results ?? []
          console.log('[zip] batch_completed, all results:', allResults)
          const completedResults = allResults
            .filter(r => r.status === 'completed' && r.image_url)
            .map(r => r.image_url!)
          console.log('[zip] completedResults:', completedResults)
          if (completedResults.length > 0) {
            downloadAllAsZip(completedResults, batchId).catch(e => console.error('[zip] download error:', e))
          } else {
            console.warn('[zip] no completed results to download')
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
