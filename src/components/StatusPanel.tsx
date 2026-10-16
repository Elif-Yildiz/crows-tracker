import { useState } from 'react'
import type { Character } from '../interfaces'
import { LEVELS, levelFor } from '../data/rules'
import { applyDamage, rest } from '../services/inventory'
import { CharacteristicsRow, DerivedRow, StaminaBar, WoundPips } from './CharacterBits'
import { Stepper, useToast } from './ui'

interface Props {
  c: Character
  onChange: (update: (c: Character) => Character) => void
}

export default function StatusPanel({ c, onChange }: Props) {
  const toast = useToast()
  const [amount, setAmount] = useState(3)
  const [piercing, setPiercing] = useState(false)
  const [xp, setXp] = useState('')
  const { level, effortMax, nextTxp } = levelFor(c.txp)
  const prevTxp = level > 10 ? (level - 9) * 30000 : LEVELS[level - 1].txp
  const xpPct = Math.min(100, ((c.txp - prevTxp) / Math.max(1, nextTxp - prevTxp)) * 100)

  const damage = () => {
    const { character, log } = applyDamage(c, amount, piercing)
    onChange(() => character)
    toast(log, character.wounds.length > c.wounds.length ? 'error' : 'info')
  }
  const heal = () => {
    onChange((x) => ({ ...x, stamina: Math.min(x.staminaMax, x.stamina + amount) }))
    toast(`${amount} Stamina iyileşti`)
  }
  const doRest = () => {
    onChange((x) => rest(x, effortMax))
    toast('Dinlenildi: Stamina doldu, 1 yara iyileşti, Effort yenilendi')
  }
  const addXp = () => {
    const n = Number(xp)
    if (!n) return
    const before = levelFor(c.txp).level
    onChange((x) => ({ ...x, txp: Math.max(0, x.txp + n) }))
    const after = levelFor(Math.max(0, c.txp + n)).level
    toast(after > before ? `Seviye atladın! Sv. ${after} · Stamina +2 ve yeni expertise ekleyebilirsin` : `${n} XP eklendi`)
    setXp('')
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-4 p-4">
        <div>
          <div className="mb-1 flex items-end justify-between">
            <span className="label mb-0">Stamina</span>
            <span className="text-2xl font-bold tabular-nums">{c.stamina}<span className="text-base text-dust">/{c.staminaMax}</span></span>
          </div>
          <StaminaBar value={c.stamina} max={c.staminaMax} />
        </div>
        <div className="flex items-center justify-between">
          <span className="label mb-0">Yaralar {c.wounds.length}/10</span>
          <WoundPips wounds={c.wounds} size="md" />
        </div>

        <div className="rounded-xl bg-ink/60 p-3 ring-1 ring-smoke/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Stepper label="Miktar" value={amount} min={1} max={99} onChange={setAmount} />
            <label className="flex min-h-10 items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[#b3261e]" checked={piercing} onChange={(e) => setPiercing(e.target.checked)} />
              Delici (P)
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={damage}>Hasar al</button>
            <button className="btn-ghost" onClick={heal}>İyileş</button>
          </div>
          <p className="mt-2 text-[11px] text-dust">Hasar önce AD'den (kalkan → zırh), sonra Stamina'dan düşer; Stamina 0 iken her hasar 1 yara olur.</p>
        </div>
        <button className="btn-ghost w-full" onClick={doRest}>🔥 Dinlen</button>
      </section>

      <section className="card space-y-3 p-4">
        <CharacteristicsRow c={c} />
        <DerivedRow c={c} />
        <div className="flex items-center justify-between">
          <span className="label mb-0">Effort</span>
          <Stepper label="Effort" value={c.effort} min={0} max={effortMax + 1} onChange={(v) => onChange((x) => ({ ...x, effort: v }))} />
        </div>
        <div className="flex items-center justify-between">
          <span className="label mb-0">Altın (gc)</span>
          <Stepper label="Altın" value={c.gold} min={0} max={99999} onChange={(v) => onChange((x) => ({ ...x, gold: v }))} />
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-end justify-between">
          <span className="label mb-0">Seviye {level} · TXP</span>
          <span className="text-sm tabular-nums text-dust">{c.txp.toLocaleString('tr-TR')} / {nextTxp.toLocaleString('tr-TR')}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink ring-1 ring-smoke">
          <div className="h-full bg-gold transition-all" style={{ width: `${xpPct}%` }} />
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addXp() }}>
          <input className="input" inputMode="numeric" placeholder="XP ekle (örn. 120)" value={xp} onChange={(e) => setXp(e.target.value.replace(/[^\d-]/g, ''))} aria-label="XP miktarı" />
          <button className="btn-ghost shrink-0">Ekle</button>
        </form>
      </section>
    </div>
  )
}
