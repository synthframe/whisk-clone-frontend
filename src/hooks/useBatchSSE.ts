import { useEffect } from 'react'
import { useBatchStore } from '../store/batchStore'
import { outputBaseURL } from '../api/client'
import type { SSEEvent, BatchJobResult } from '../types'

export function useBatchSSE(batchId: string | null) {
  const updateJob = useBatchStore((s) => s.updateJob)
  const appendEvent = useBatchStore((s) => s.appendEvent)

  useEffect(() => {
    if (!batchId) return

    const stored = localStorage.getItem('whisk-auth')
    let token = ''
    try {
      const { state } = JSON.parse(stored ?? '{}')
      token = state?.token ?? ''
    } catch {}

    const es = new EventSource(`${outputBaseURL}/api/batch/${batchId}/stream?token=${encodeURIComponent(token)}`)

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
