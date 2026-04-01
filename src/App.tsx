import { FormEvent, useEffect, useMemo, useState } from 'react'

type CharacterReference = {
  id: string
  image_url: string
}

type CharacterSet = {
  id: string
  name: string
  description: string
  references: CharacterReference[]
}

type BatchItem = {
  id: string
  prompt_index: number
  prompt_text: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  image_url?: string
  error?: string
}

type BatchJob = {
  id: string
  character_set_id: string
  title: string
  global_style: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  total_count: number
  completed_count: number
  failed_count: number
  items: BatchItem[]
}

const apiHost = import.meta.env.VITE_API_BASE_URL ?? 'https://synthframeapi.dsmhs.kr'
const apiBase = `${apiHost}/api`

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, init)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || 'request failed')
  }
  return response.json() as Promise<T>
}

export default function App() {
  const [characterSets, setCharacterSets] = useState<CharacterSet[]>([])
  const [selectedSetId, setSelectedSetId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [batchTitle, setBatchTitle] = useState('')
  const [batchStyle, setBatchStyle] = useState('')
  const [promptsText, setPromptsText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [activeBatch, setActiveBatch] = useState<BatchJob | null>(null)
  const [loadingSets, setLoadingSets] = useState(true)
  const [submittingSet, setSubmittingSet] = useState(false)
  const [submittingBatch, setSubmittingBatch] = useState(false)
  const [error, setError] = useState('')

  const selectedSet = useMemo(
    () => characterSets.find((item) => item.id === selectedSetId) ?? null,
    [characterSets, selectedSetId],
  )

  const parsedPrompts = useMemo(
    () => promptsText.split('\n').map((item) => item.trim()).filter(Boolean),
    [promptsText],
  )

  useEffect(() => {
    loadCharacterSets()
  }, [])

  useEffect(() => {
    if (!activeBatch || activeBatch.status === 'completed' || activeBatch.status === 'failed') {
      return
    }

    const timer = window.setInterval(async () => {
      try {
        const nextBatch = await fetchJSON<BatchJob>(`/batches/${activeBatch.id}`)
        setActiveBatch(nextBatch)
      } catch (err) {
        console.error(err)
      }
    }, 2500)

    return () => window.clearInterval(timer)
  }, [activeBatch])

  async function loadCharacterSets() {
    setLoadingSets(true)
    setError('')
    try {
      const data = await fetchJSON<{ character_sets: CharacterSet[] }>('/character-sets')
      setCharacterSets(data.character_sets)
      if (!selectedSetId && data.character_sets[0]) {
        setSelectedSetId(data.character_sets[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load character sets')
    } finally {
      setLoadingSets(false)
    }
  }

  async function handleCreateCharacterSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingSet(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      files.forEach((file) => formData.append('references', file))

      const created = await fetchJSON<CharacterSet>('/character-sets', {
        method: 'POST',
        body: formData,
      })

      setCharacterSets((current) => [created, ...current])
      setSelectedSetId(created.id)
      setName('')
      setDescription('')
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to create character set')
    } finally {
      setSubmittingSet(false)
    }
  }

  async function handleRunBatch() {
    if (!selectedSetId || parsedPrompts.length === 0) {
      setError('캐릭터셋과 프롬프트를 먼저 준비하세요.')
      return
    }

    setSubmittingBatch(true)
    setError('')

    try {
      const batch = await fetchJSON<BatchJob>('/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_set_id: selectedSetId,
          title: batchTitle,
          global_style: batchStyle,
          prompts: parsedPrompts,
          width: 1024,
          height: 1024,
        }),
      })
      setActiveBatch(batch)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to run batch')
    } finally {
      setSubmittingBatch(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
        <header className="mb-6 border-b border-white/10 pb-4">
          <p className="text-sm font-medium text-cyan-300">Synthframe</p>
          <h1 className="mt-2 text-3xl font-semibold">캐릭터셋 배치 생성</h1>
          <p className="mt-2 text-sm text-slate-400">
            캐릭터셋을 만든 뒤 프롬프트 묶음을 넣으면 같은 캐릭터 기준으로 배치 생성합니다.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-[#10172a] p-5">
              <h2 className="text-lg font-semibold">1. 캐릭터셋 만들기</h2>
              <form className="mt-4 space-y-4" onSubmit={handleCreateCharacterSet}>
                <label className="block text-sm text-slate-300">
                  이름
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="예: Mina episode pack"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                    required
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  캐릭터 설명
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="얼굴, 헤어, 분위기, 체형, 의상 톤"
                    className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  레퍼런스 이미지
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                    className="mt-2 block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  />
                </label>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {files.map((file) => (
                      <div key={file.name} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingSet}
                  className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingSet ? '생성 중...' : '캐릭터셋 만들기'}
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#10172a] p-5">
              <h2 className="text-lg font-semibold">2. 배치 생성</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-300">캐릭터셋 선택</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {loadingSets && <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">로딩 중...</div>}
                    {!loadingSets && characterSets.length === 0 && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                        먼저 캐릭터셋을 만들어야 합니다.
                      </div>
                    )}
                    {characterSets.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedSetId(item.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          selectedSetId === item.id
                            ? 'border-cyan-300/60 bg-cyan-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-100">{item.name}</p>
                          <span className="text-xs text-slate-400">{item.references.length} refs</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{item.description || '설명 없음'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSet && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-medium text-slate-200">{selectedSet.name}</p>
                    <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-5">
                      {selectedSet.references.map((reference) => (
                        <img
                          key={reference.id}
                          src={`${apiHost}${reference.image_url}`}
                          className="aspect-square w-full rounded-xl object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <label className="block text-sm text-slate-300">
                  배치 이름
                  <input
                    value={batchTitle}
                    onChange={(event) => setBatchTitle(event.target.value)}
                    placeholder="예: Episode 03 shots"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  배치 전역 스타일
                  <textarea
                    value={batchStyle}
                    onChange={(event) => setBatchStyle(event.target.value)}
                    placeholder="bright romantic commercial photography"
                    className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  프롬프트 묶음
                  <textarea
                    value={promptsText}
                    onChange={(event) => setPromptsText(event.target.value)}
                    placeholder={['close-up smile shot on rooftop', 'medium shot in subway platform', 'walking shot in rainy alley'].join('\n')}
                    className="mt-2 h-52 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                  />
                </label>

                <button
                  type="button"
                  disabled={submittingBatch || !selectedSetId || parsedPrompts.length === 0}
                  onClick={handleRunBatch}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingBatch ? '배치 생성 시작 중...' : `배치 실행 (${parsedPrompts.length})`}
                </button>
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-white/10 bg-[#10172a] p-5">
            <h2 className="text-lg font-semibold">3. 결과</h2>

            {!activeBatch && (
              <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
                배치를 실행하면 결과가 여기에 표시됩니다.
              </div>
            )}

            {activeBatch && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <p className="font-medium text-slate-100">{activeBatch.title || 'Untitled batch'}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activeBatch.status} · {activeBatch.completed_count}/{activeBatch.total_count} 완료 · {activeBatch.failed_count} 실패
                  </p>
                </div>

                <div className="grid gap-4">
                  {activeBatch.items.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <div className="border-b border-white/10 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-100">#{item.prompt_index}</p>
                          <span className="text-xs text-slate-400">{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.prompt_text}</p>
                        {item.error && <p className="mt-2 text-xs text-rose-300">{item.error}</p>}
                      </div>

                      {item.image_url ? (
                        <img src={`${apiHost}${item.image_url}`} className="aspect-square w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-slate-950/40 text-sm text-slate-500">
                          {item.status === 'failed' ? '생성 실패' : '생성 중...'}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
