import { useSlotStore } from '../store/slotStore'
import { useGenerateStore } from '../store/generateStore'
import { generateImage, pollGenerateStatus } from '../api/generate'
import { outputBaseURL } from '../api/client'

async function autoDownload(imageUrl: string, filename: string) {
  const res = await fetch(`${outputBaseURL}${imageUrl}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function useGenerate() {
  const slots = useSlotStore((s) => s.slots)
  const { selectedPreset, setGenerating, setResult, setError, setJobId } = useGenerateStore()

  const generate = async () => {
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await generateImage({
        subject_prompt: slots.subject.prompt,
        scene_prompt: slots.scene.prompt,
        style_prompt: slots.style.prompt,
        style_preset: selectedPreset,
      })
      setJobId(res.id)

      // Poll until done
      const poll = async () => {
        const status = await pollGenerateStatus(res.id)
        if (status.status === 'completed' && status.image_url) {
          setResult(status.image_url)
          setGenerating(false)
          autoDownload(status.image_url, `whisk_${res.id.slice(0, 8)}.png`)
        } else if (status.status === 'failed') {
          setError(status.error ?? 'Generation failed')
          setGenerating(false)
        } else {
          setTimeout(poll, 2000)
        }
      }
      setTimeout(poll, 2000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      setError(msg)
      setGenerating(false)
    }
  }

  return { generate }
}
