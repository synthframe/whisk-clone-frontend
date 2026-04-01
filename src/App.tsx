import { FormEvent, useEffect, useMemo, useState } from 'react'

type CharacterReference = {
  id: string
  image_url: string
}

type CharacterSet = {
  id: string
  name: string
  description: string
  global_style: string
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

const apiBase = `${import.meta.env.VITE_API_BASE_URL ?? 'https://synthframeapi.dsmhs.kr'}/api`

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
  const [setStyle, setSetStyle] = useState('')
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
      formData.append('global_style', setStyle)
      files.forEach((file) => formData.append('references', file))

      const created = await fetchJSON<CharacterSet>('/character-sets', {
        method: 'POST',
        body: formData,
      })

      setCharacterSets((current) => [created, ...current])
      setSelectedSetId(created.id)
      setName('')
      setDescription('')
      setSetStyle('')
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
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Synthframe</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Character set batch studio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            캐릭터셋을 만들고, 선택한 캐릭터셋 기준으로 프롬프트 묶음을 한 번에 배치 생성합니다.
            전역 스타일은 각 배치 전체에 공통으로 적용됩니다.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)_460px]">
          <section className="rounded-[28px] border border-white/10 bg-[#10172a] p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step 1</p>
                <h2 className="mt-2 text-2xl font-semibold">Character set</h2>
              </div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                refs {files.length}
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleCreateCharacterSet}>
              <label className="block text-sm text-slate-300">
                이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: Mina episode pack"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                캐릭터 설명
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="얼굴 인상, 헤어, 분위기, 의상 톤 등"
                  className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <label className="block text-sm text-slate-300">
                전역 스타일
                <textarea
                  value={setStyle}
                  onChange={(event) => setSetStyle(event.target.value)}
                  placeholder="clean commercial lighting, premium fashion editorial, shallow depth of field"
                  className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <label className="block text-sm text-slate-300">
                레퍼런스 이미지
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                  className="mt-2 block w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300"
                />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div key={file.name} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingSet}
                className="w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingSet ? '생성 중...' : '캐릭터셋 만들기'}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#10172a] p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step 2</p>
                <h2 className="mt-2 text-2xl font-semibold">Batch generation</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                prompts {parsedPrompts.length}
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">캐릭터셋 선택</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {loadingSets && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">로딩 중...</div>}
                  {!loadingSets && characterSets.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      먼저 캐릭터셋을 만들어야 합니다.
                    </div>
                  )}
                  {characterSets.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSetId(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedSetId === item.id
                          ? 'border-cyan-300/60 bg-cyan-400/10'
                          : 'border-white/10 bg-white/5 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-100">{item.name}</p>
                        <span className="text-xs text-slate-400">refs {item.references.length}</span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-400">{item.description || '설명 없음'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSet && (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-slate-200">선택된 캐릭터셋</p>
                  <p className="mt-1 text-sm text-slate-400">{selectedSet.name}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Reference gallery</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {selectedSet.references.map((reference) => (
                      <img
                        key={reference.id}
                        src={`${import.meta.env.VITE_API_BASE_URL ?? 'https://synthframeapi.dsmhs.kr'}${reference.image_url}`}
                        className="aspect-square w-full rounded-2xl object-cover"
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
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <label className="block text-sm text-slate-300">
                배치 전역 스타일
                <textarea
                  value={batchStyle}
                  onChange={(event) => setBatchStyle(event.target.value)}
                  placeholder="bright romantic commercial photography, soft spring color grading"
                  className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <label className="block text-sm text-slate-300">
                프롬프트 묶음
                <textarea
                  value={promptsText}
                  onChange={(event) => setPromptsText(event.target.value)}
                  placeholder={['1. close-up smile shot on rooftop', '2. medium shot in subway platform', '3. walking shot in rainy alley'].join('\n')}
                  className="mt-2 h-72 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <button
                type="button"
                disabled={submittingBatch || !selectedSetId || parsedPrompts.length === 0}
                onClick={handleRunBatch}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingBatch ? '배치 생성 시작 중...' : `배치 실행 (${parsedPrompts.length} prompts)`}
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#10172a] p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step 3</p>
                <h2 className="mt-2 text-2xl font-semibold">Batch output</h2>
              </div>
              {activeBatch && (
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {activeBatch.completed_count}/{activeBatch.total_count}
                </span>
              )}
            </div>

            {!activeBatch && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-sm leading-6 text-slate-400">
                배치를 실행하면 각 프롬프트에 대한 생성 상태와 결과 이미지가 여기 표시됩니다.
              </div>
            )}

            {activeBatch && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-100">{activeBatch.title || 'Untitled batch'}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">status {activeBatch.status}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>done {activeBatch.completed_count}</p>
                      <p>failed {activeBatch.failed_count}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {activeBatch.items.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                      <div className="border-b border-white/10 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-100">#{item.prompt_index}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.prompt_text}</p>
                        {item.error && <p className="mt-2 text-xs text-rose-300">{item.error}</p>}
                      </div>

                      {item.image_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL ?? 'https://synthframeapi.dsmhs.kr'}${item.image_url}`}
                          className="aspect-square w-full object-cover"
                          loading="lazy"
                        />
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
