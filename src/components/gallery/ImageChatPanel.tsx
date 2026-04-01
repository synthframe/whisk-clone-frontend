import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Download, MessageSquare } from 'lucide-react'
import { outputBaseURL } from '../../api/client'
import { refineImage } from '../../api/refine'
import type { ImageHistoryItem } from '../../api/images'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  image_url?: string
  subject_prompt?: string
  scene_prompt?: string
  style_prompt?: string
}

function buildRefineHistory(messages: ChatMessage[], nextUserInput: string) {
  const history = messages
    .filter((message) => message.content.trim())
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))

  history.push({ role: 'user' as const, content: nextUserInput.trim() })
  return history
}

interface Props {
  image: ImageHistoryItem
  onClose: () => void
}

async function downloadImg(url: string, filename: string) {
  const res = await fetch(`${outputBaseURL}${url}`)
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

export function ImageChatPanel({ image, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '이미지를 어떻게 수정할까요? 피드백을 입력해주세요.',
      image_url: image.url,
      subject_prompt: image.subject_prompt,
      scene_prompt: image.scene_prompt,
      style_prompt: image.style_prompt,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPrompts, setCurrentPrompts] = useState({
    subject: image.subject_prompt || '',
    scene: image.scene_prompt || '',
    style: image.style_prompt || '',
    preset: image.style_preset || '',
    width: image.width || 1024,
    height: image.height || 1024,
  })
  // Track the latest image URL to use as img2img reference
  const [currentImageUrl, setCurrentImageUrl] = useState(image.url)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    const feedback = input.trim()
    if (!feedback || loading) return
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', content: feedback }])
    setLoading(true)

    try {
      const result = await refineImage({
        subject_prompt: currentPrompts.subject,
        scene_prompt: currentPrompts.scene,
        style_prompt: currentPrompts.style,
        style_preset: currentPrompts.preset,
        width: currentPrompts.width,
        height: currentPrompts.height,
        feedback,
        original_url: currentImageUrl,
        history: buildRefineHistory(messages, feedback),
      })

      setCurrentPrompts((prev) => ({
        ...prev,
        subject: result.subject_prompt,
        scene: result.scene_prompt,
        style: result.style_prompt,
      }))
      setCurrentImageUrl(result.image_url)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '피드백을 반영해서 새 이미지를 생성했습니다.',
          image_url: result.image_url,
          subject_prompt: result.subject_prompt,
          scene_prompt: result.scene_prompt,
          style_prompt: result.style_prompt,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '이미지 생성에 실패했습니다. 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0c0c0f] border-l border-white/[0.08] flex flex-col shadow-2xl animate-slide-in-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">이미지 리파인</h3>
              <p className="text-xs text-slate-600">피드백으로 반복 수정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.role === 'user' ? 'max-w-[80%]' : 'w-full'}`}>
                {msg.image_url && (
                  <div className="group relative rounded-xl overflow-hidden mb-2 border border-white/[0.08] bg-[#141418]">
                    <img
                      src={`${outputBaseURL}${msg.image_url}`}
                      alt=""
                      className="w-full object-cover"
                    />
                    <button
                      onClick={() => downloadImg(msg.image_url!, `whisk_${i}.png`)}
                      className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/[0.08]"
                    >
                      <Download className="w-3 h-3" />
                      저장
                    </button>
                  </div>
                )}
                {msg.image_url && msg.subject_prompt && (
                  <div className="mb-1.5 px-3 py-2 bg-[#141418] rounded-xl border border-white/[0.05] space-y-0.5">
                    {msg.subject_prompt && <p className="text-[10px] text-slate-600"><span className="text-slate-500">주제</span> {msg.subject_prompt}</p>}
                    {msg.scene_prompt && <p className="text-[10px] text-slate-600"><span className="text-slate-500">배경</span> {msg.scene_prompt}</p>}
                    {msg.style_prompt && <p className="text-[10px] text-slate-600"><span className="text-slate-500">스타일</span> {msg.style_prompt}</p>}
                  </div>
                )}
                <div
                  className={`text-xs px-3 py-2 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-violet-600/25 text-violet-200 border border-violet-500/25'
                      : 'bg-[#141418] text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#141418] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                <span className="text-xs text-slate-500">생성 중...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/[0.06] shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="예: 더 어둡게, 배경을 바다로 바꿔줘..."
              disabled={loading}
              className="flex-1 bg-[#141418] text-slate-200 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-700 transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
