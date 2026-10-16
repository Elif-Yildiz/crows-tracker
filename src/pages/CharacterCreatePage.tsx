import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Characteristic } from '../interfaces'
import { BACKGROUNDS, STARTING_EQUIPMENT } from '../data/backgrounds'
import { createFromDraft, roll3d6, rollBackgroundIndex } from '../services/characterFactory'
import { createCharacter, useGame } from '../services/storage'
import { signed, useToast } from '../components/ui'
import NotFound, { Loading } from './NotFound'

const CHAR_LABELS: Record<Characteristic, string> = { agility: 'Agility', mind: 'Mind', strength: 'Strength' }
const ALL: Characteristic[] = ['agility', 'mind', 'strength']

function Die({ value }: { value: number }) {
  return <span className="animate-pop inline-grid h-9 w-9 place-items-center rounded-lg bg-bone text-lg font-bold text-ink shadow">{value}</span>
}

export default function CharacterCreatePage() {
  const { code } = useParams()
  const { game, loading } = useGame(code)
  const navigate = useNavigate()
  const toast = useToast()

  const [info, setInfo] = useState({ playerName: '', name: '', feature: '' })
  const [bgIndex, setBgIndex] = useState(0)
  const [dice, setDice] = useState<readonly number[] | null>(null)
  const bg = BACKGROUNDS[bgIndex]
  const allowed: Characteristic[] = bg.characteristic[0] === 'any' ? ALL : (bg.characteristic as Characteristic[])
  const [primary, setPrimary] = useState<Characteristic>(allowed[0])
  const [spread, setSpread] = useState<'1/0' | '-1/2'>('1/0')
  const [flipped, setFlipped] = useState(false)
  const [gold, setGold] = useState(() => roll3d6())

  const effectivePrimary = allowed.includes(primary) ? primary : allowed[0]
  const stats = useMemo(() => {
    const others = ALL.filter((c) => c !== effectivePrimary)
    const values = spread === '1/0' ? [1, 0] : [-1, 2]
    const [a, b] = flipped ? [values[1], values[0]] : values
    return { [effectivePrimary]: 2, [others[0]]: a, [others[1]]: b } as Record<Characteristic, number>
  }, [effectivePrimary, spread, flipped])

  if (loading) return <Loading />
  if (!game) return <NotFound what="Oyun" />

  const roll = () => {
    const r = rollBackgroundIndex()
    setDice(r.dice)
    setBgIndex(r.index)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!info.name.trim()) return toast('Karakterine bir isim ver', 'error')
    const character = createFromDraft(game.id, {
      ...info,
      background: bg,
      ...stats,
      expertises: bg.expertises,
      gold: gold + (bg.extraGold ?? 0),
    })
    createCharacter(character).catch(() => toast('Kaydedilemedi, bağlantını kontrol et', 'error'))
    toast(`${character.name} oyuna katıldı`)
    navigate(`/game/${game.code}/c/${character.id}`)
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="label">{game.name} · {game.code}</p>
        <h1 className="heading text-2xl font-extrabold sm:text-3xl">Yeni Crow Yarat</h1>
      </div>

      <section className="card space-y-3 p-5">
        <h2 className="heading text-lg">1 · Kimlik</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="pn">Oyuncu adı</label><input id="pn" className="input" value={info.playerName} onChange={(e) => setInfo({ ...info, playerName: e.target.value })} placeholder="Senin adın" /></div>
          <div><label className="label" htmlFor="cn">Karakter adı *</label><input id="cn" className="input" required value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Boris" /></div>
        </div>
        <div><label className="label" htmlFor="ft">Ayırt edici özellik</label><input id="ft" className="input" value={info.feature} onChange={(e) => setInfo({ ...info, feature: e.target.value })} placeholder="Yüzünde karga dövmesi, kısık bir ses…" /></div>
      </section>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading text-lg">2 · Geçmiş (Background)</h2>
          <div className="flex items-center gap-2">
            {dice && dice.map((d, i) => <Die key={`${i}-${d}-${bgIndex}`} value={d} />)}
            <button type="button" className="btn-ghost" onClick={roll}>🎲 2d6 At</button>
          </div>
        </div>
        <select className="input" value={bgIndex} onChange={(e) => { setBgIndex(Number(e.target.value)); setDice(null) }} aria-label="Geçmiş seç">
          {BACKGROUNDS.map((b, i) => (
            <option key={b.name} value={i}>{Math.floor(i / 6) + 1}-{(i % 6) + 1} · {b.name}</option>
          ))}
        </select>
        <div className="rounded-xl bg-ink/60 p-4 ring-1 ring-smoke/60">
          <p className="mb-3 text-dust italic">{bg.description}</p>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="label">Stamina</dt><dd className="text-lg font-bold">{bg.stamina}</dd></div>
            <div><dt className="label">Trait</dt><dd>{bg.trait}</dd></div>
            <div className="sm:col-span-2"><dt className="label">Expertise</dt><dd className="flex flex-wrap gap-1">{bg.expertises.map((x) => <span key={x} className="rounded-md bg-ash px-2 py-0.5 text-xs">{x}</span>)}</dd></div>
            <div className="sm:col-span-2"><dt className="label">Başlangıç ekipmanı</dt><dd className="text-dust">{[...STARTING_EQUIPMENT, ...bg.equipment].map((x) => x.replace(':', ' ×')).join(', ')}</dd></div>
          </dl>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="heading text-lg">3 · Karakteristikler</h2>
        <div>
          <p className="label">2 olacak karakteristik</p>
          <div className="flex flex-wrap gap-2">
            {allowed.map((c) => (
              <button type="button" key={c} onClick={() => setPrimary(c)} className={effectivePrimary === c ? 'btn-primary' : 'btn-ghost'}>{CHAR_LABELS[c]}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Diğerleri</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSpread('1/0')} className={spread === '1/0' ? 'btn-primary' : 'btn-ghost'}>+1 ve 0</button>
            <button type="button" onClick={() => setSpread('-1/2')} className={spread === '-1/2' ? 'btn-primary' : 'btn-ghost'}>−1 ve +2</button>
            <button type="button" onClick={() => setFlipped(!flipped)} className="btn-ghost">⇄ Yer değiştir</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ALL.map((c) => (
            <div key={c} className={`rounded-xl p-3 text-center ring-1 ${c === effectivePrimary ? 'bg-blood/15 ring-blood/60' : 'bg-ink/60 ring-smoke/60'}`}>
              <div className="text-2xl font-bold">{signed(stats[c])}</div>
              <div lang="en" className="text-xs tracking-wider text-dust uppercase">{CHAR_LABELS[c]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="heading text-lg">4 · Altın</h2>
          <p className="text-sm text-dust">3d6 gc{bg.extraGold ? ` + ${bg.extraGold} (geçmiş)` : ''} · Hız 5 · Effort 2</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gold tabular-nums">{gold + (bg.extraGold ?? 0)} gc</span>
          <button type="button" className="btn-ghost" onClick={() => setGold(roll3d6())}>🎲 Yeniden at</button>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={() => navigate(`/game/${game.code}`)}>Vazgeç</button>
        <button className="btn-primary sm:px-8">Crow'u Yarat</button>
      </div>
    </form>
  )
}
