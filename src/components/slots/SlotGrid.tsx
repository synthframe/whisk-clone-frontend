import { useState } from 'react'
import { SlotCard } from './SlotCard'
import type { SlotType } from '../../types'

const SLOTS: SlotType[] = ['subject', 'scene', 'style']

export function SlotGrid() {
  const [modes, setModes] = useState<Record<SlotType, 'image' | 'text'>>({
    subject: 'text',
    scene: 'text',
    style: 'text',
  })

  function setMode(type: SlotType, mode: 'image' | 'text') {
    setModes((prev) => ({ ...prev, [type]: mode }))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {SLOTS.map((type) => (
        <SlotCard
          key={type}
          type={type}
          inputMode={modes[type]}
          onModeChange={(mode) => setMode(type, mode)}
        />
      ))}
    </div>
  )
}
