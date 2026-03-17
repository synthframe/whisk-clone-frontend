import { useSlotStore } from '../store/slotStore'
import { useGenerateStore } from '../store/generateStore'
import { generateImage, pollGenerateStatus } from '../api/generate'

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

      const poll = async () => {
        const status = await pollGenerateStatus(res.id)
        if (status.status === 'completed' && status.image_url) {
          setResult(status.image_url)
          setGenerating(false)
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
