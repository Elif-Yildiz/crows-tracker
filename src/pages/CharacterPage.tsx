import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Character } from '../interfaces'
import { deleteCharacter, updateCharacter, useGame, useStore } from '../services/storage'
import { ConfirmButton, useToast } from '../components/ui'
import { DeadBadge } from '../components/CharacterBits'
import StatusPanel from '../components/StatusPanel'
import InventoryBoard from '../components/inventory/InventoryBoard'
import CharacterEditModal from '../components/CharacterEditModal'
import { levelFor } from '../data/rules'
import NotFound, { Loading } from './NotFound'

type Tab = 'status' | 'inventory' | 'info'
const TABS: { id: Tab; label: string }[] = [
  { id: 'status', label: 'Durum' },
  { id: 'inventory', label: 'Envanter' },
  { id: 'info', label: 'Bilgi' },
]

export default function CharacterPage() {
  const { code, id } = useParams()
  const { characters, loadedGames } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('inventory')
  const [editing, setEditing] = useState(false)
  const { game, loading } = useGame(code)
  const c = characters.find((x) => x.id === id && x.gameId === game?.id)

  const onChange = useCallback((update: (c: Character) => Character) => id && updateCharacter(id, update), [id])

  if (loading || (game && !c && !loadedGames.includes(game.id))) return <Loading />
  if (!game || !c) return <NotFound what="Karakter" />

  // Mobilde sekmeli, geniş ekranda iki sütun.
  const show = (t: Tab) => (tab === t ? 'block' : 'hidden lg:block')

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/game/${game.code}`} className="text-xs text-dust hover:text-gold">← {game.name}</Link>
          <h1 className="heading flex items-center gap-2 truncate text-2xl font-extrabold sm:text-3xl">
            {c.name} <DeadBadge c={c} />
          </h1>
          <p className="truncate text-sm text-dust">
            {c.background} · Seviye {levelFor(c.txp).level}{c.playerName && ` · ${c.playerName}`}
          </p>
        </div>
        <button className="btn-ghost shrink-0 text-sm" onClick={() => setEditing(true)}>Düzenle</button>
      </div>

      <nav className="sticky top-0 z-30 -mx-4 grid grid-cols-3 gap-1 bg-ink/90 px-4 py-2 backdrop-blur lg:hidden" aria-label="Karakter sekmeleri">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`min-h-11 rounded-xl text-sm font-semibold transition ${tab === t.id ? 'bg-bone text-ink' : 'bg-ash text-dust'}`} aria-current={tab === t.id}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-4">
          <div className={show('status')}>
            <StatusPanel c={c} onChange={onChange} />
          </div>
          <div className={show('info')}>
            <InfoPanel c={c} onNotes={(notes) => onChange((x) => ({ ...x, notes }))} />
            <ConfirmButton
              className="btn-danger mt-4 w-full"
              onConfirm={() => { deleteCharacter(c.id); toast(`${c.name} silindi`); navigate(`/game/${game.code}`) }}
            >
              Karakteri sil
            </ConfirmButton>
          </div>
        </aside>
        <div className={show('inventory')}>
          <InventoryBoard character={c} onChange={onChange} />
        </div>
      </div>

      {editing && <CharacterEditModal
        open
        c={c}
        onClose={() => setEditing(false)}
        onSave={(next) => { onChange(() => next); setEditing(false); toast('Karakter güncellendi') }}
      />}
    </div>
  )
}

function InfoPanel({ c, onNotes }: { c: Character; onNotes: (n: string) => void }) {
  const [notes, setNotes] = useState(c.notes)
  return (
    <section className="card space-y-4 p-4">
      {c.feature && <div><p className="label">Ayırt edici özellik</p><p className="italic">{c.feature}</p></div>}
      <div><p className="label">Trait</p><p>{c.trait || '—'}</p></div>
      <div>
        <p className="label">Expertise</p>
        <div className="flex flex-wrap gap-1">
          {c.expertises.map((x) => <span key={x} className="rounded-md bg-ash px-2 py-0.5 text-xs">{x}</span>)}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">Notlar</label>
        <textarea id="notes" className="input min-h-28 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== c.notes && onNotes(notes)} placeholder="NPC bağlantısı, görevler, ipuçları…" />
      </div>
    </section>
  )
}
