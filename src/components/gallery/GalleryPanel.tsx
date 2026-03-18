import { useEffect, useState } from 'react'
import { RefreshCw, Download, GalleryHorizontal, ExternalLink, MessageSquare } from 'lucide-react'
import { getImages } from '../../api/images'
import type { ImageHistoryItem } from '../../api/images'
import { outputBaseURL } from '../../api/client'
import { ImageChatPanel } from './ImageChatPanel'

function SkeletonCard() {
  return (
    <div className="aspect-square rounded-xl skeleton" />
  )
}

async function downloadImage(url: string, filename: string) {
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

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function GalleryPanel() {
  const [images, setImages] = useState<ImageHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [chatImage, setChatImage] = useState<ImageHistoryItem | null>(null)

  const fetchImages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getImages()
      setImages(data)
    } catch {
      setError('이미지를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleDownload = async (item: ImageHistoryItem) => {
    setDownloadingId(item.id)
    try {
      await downloadImage(item.url, `whisk_${item.id.slice(0, 8)}.png`)
    } catch {
      // ignore
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
    {chatImage && <ImageChatPanel image={chatImage} onClose={() => setChatImage(null)} />}
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">이미지 갤러리</h2>
          <p className="text-xs text-slate-500 mt-0.5">내가 생성한 이미지 목록</p>
        </div>
        <button
          onClick={fetchImages}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent border border-white/[0.08] text-sm text-slate-400 hover:border-white/[0.18] hover:text-slate-200 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#141418] border border-white/[0.08] flex items-center justify-center">
            <GalleryHorizontal className="w-8 h-8 text-slate-700" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">아직 생성된 이미지가 없습니다</p>
            <p className="text-xs text-slate-600 mt-1">이미지를 생성하면 여기에 표시됩니다</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-600">{images.length}개의 이미지</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[#141418] border border-white/[0.06]">
                <img
                  src={`${outputBaseURL}${item.url}`}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200" />

                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setChatImage(item)}
                      className="flex-1 flex items-center justify-center gap-1 bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <MessageSquare className="w-3 h-3" />
                      리파인
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                      className="flex-1 flex items-center justify-center gap-1 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-slate-200 text-xs font-medium py-1.5 rounded-lg transition-colors disabled:opacity-60 border border-white/[0.08]"
                    >
                      <Download className="w-3 h-3" />
                      {downloadingId === item.id ? '...' : '저장'}
                    </button>
                    <a
                      href={`${outputBaseURL}${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-black/70 backdrop-blur-sm hover:bg-black/90 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors border border-white/[0.08]"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/70 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  )
}
