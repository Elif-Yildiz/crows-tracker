import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteCharacter, exportGame, updateGame, useGame, useStore } from '../services/storage'
import { ConfirmButton, Modal, useToast } from '../components/ui'
import { CharacteristicsRow, DeadBadge, StaminaBar, WoundPips } from '../components/CharacterBits'
import { speedOf, totalAd } from '../services/inventory'
import { levelFor } from '../data/rules'
import NotFound, { Loading } from './NotFound'

export default function GamePage() {
  const { code } = useParams()
  const { characters, uid } = useStore()
  const toast = useToast()
  const { game, loading } = useGame(code)
  const crew = useMemo(() => characters.filter((c) => c.gameId === game?.id), [characters, game?.id])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', refName: '', village: '' })

  if (loading) return <Loading />
  if (!game) return <NotFound what="Oyun" />

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(game.code)
      toast('Kod kopyalandı')
    } catch {
      toast(`Kod: ${game.code}`)
    }
  }

  const download = () => {
    const blob = new Blob([exportGame(game.id)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `crows-${game.code}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label">Oyun</p>
            <h1 className="heading text-2xl font-extrabold sm:text-3xl">{game.name}</h1>
            <p className="mt-1 text-sm text-dust">
              {game.refName && `Ref: ${game.refName}`}{game.refName && game.village && ' · '}{game.village && `Köy: ${game.village}`}
            </p>
          </div>
          <button onClick={copy} className="group rounded-2xl border border-dashed border-gold/50 bg-ink/60 px-5 py-3 text-center transition hover:border-gold">
            <span className="label block">Katılım kodu · kopyala</span>
            <span className="font-mono text-3xl font-bold tracking-[0.3em] text-gold">{game.code}</span>
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/game/${game.code}/new`} className="btn-primary flex-1 sm:flex-none">+ Karakter Ekle</Link>
          {game.ownerUid === uid && (<button className="btn-ghost flex-1 sm:flex-none" onClick={() => { setForm({ name: game.name, refName: game.refName, village: game.village }); setEditing(true) }}>Düzenle</button>)}
          <button className="btn-ghost flex-1 sm:flex-none" onClick={download}>Yedek indir</button>
        </div>
      </section>

      <section>
        <h2 className="heading mb-3 text-xl">Crow'lar ({crew.length})</h2>
        {crew.length === 0 ? (
          <div className="card p-8 text-center text-dust">
            Henüz kimse katılmadı. Kodu paylaş ya da <Link className="text-gold underline" to={`/game/${game.code}/new`}>ilk karakteri ekle</Link>.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crew.map((c) => (
              <li key={c.id} className="card flex flex-col gap-3 p-4">
                <Link to={`/game/${game.code}/c/${c.id}`} className="group space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="heading truncate text-lg group-hover:text-gold">{c.name}</h3>
                      <p className="truncate text-xs text-dust">{c.background} · Sv. {levelFor(c.txp).level}{c.playerName && ` · ${c.playerName}`}</p>
                    </div>
                    <DeadBadge c={c} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-dust">
                      <span>Stamina</span>
                      <span className="tabular-nums">{c.stamina}/{c.staminaMax} · AD {totalAd(c)} · Hız {speedOf(c)}</span>
                    </div>
                    <StaminaBar value={c.stamina} max={c.staminaMax} />
                  </div>
                  <WoundPips wounds={c.wounds} />
                  <CharacteristicsRow c={c} />
                </Link>
                <div className="mt-auto flex gap-2">
                  <Link to={`/game/${game.code}/c/${c.id}`} className="btn-ghost flex-1 text-sm">Karakter</Link>
                  <ConfirmButton className="btn-danger flex-1 text-sm" onConfirm={() => deleteCharacter(c.id).then(() => toast(`${c.name} silindi`))}>Sil</ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={editing} onClose={() => setEditing(false)} title="Oyunu düzenle">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) return
            updateGame(game.id, form).catch(() => toast('Sadece oyunu kuran cihaz düzenleyebilir', 'error'))
            setEditing(false)
            toast('Oyun güncellendi')
          }}
        >
          <div><label className="label" htmlFor="e-name">Oyun adı</label><input id="e-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-ref">Ref</label><input id="e-ref" className="input" value={form.refName} onChange={(e) => setForm({ ...form, refName: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-vil">Köy</label><input id="e-vil" className="input" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} /></div>
          <button className="btn-primary w-full">Kaydet</button>
        </form>
      </Modal>
    </div>
  )
}
