import type { Character } from '../interfaces'
import { levelFor } from '../data/rules'
import { isDead, speedOf, totalAd } from '../services/inventory'
import { signed } from './ui'

export function StaminaBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const tone = pct > 60 ? 'bg-moss' : pct > 25 ? 'bg-gold' : 'bg-blood'
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-ink ring-1 ring-smoke" role="meter" aria-valuenow={value} aria-valuemax={max} aria-label="Stamina">
      <div className={`h-full rounded-full transition-all duration-300 ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function WoundPips({ wounds, size = 'sm' }: { wounds: number[]; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-1" aria-label={`${wounds.length}/10 yara`}>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={`${s} rotate-45 rounded-[2px] ${i < wounds.length ? 'bg-blood shadow-[0_0_6px] shadow-blood/60' : 'bg-smoke'}`} />
      ))}
    </div>
  )
}

export function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl bg-ink/60 px-2 py-2 text-center ring-1 ring-smoke/60">
      <div className={`text-xl font-bold tabular-nums ${accent ?? ''}`}>{value}</div>
      <div lang="en" className="text-[10px] font-semibold tracking-wider text-dust uppercase">{label}</div>
    </div>
  )
}

export function CharacteristicsRow({ c }: { c: Character }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label="Agility" value={signed(c.agility)} />
      <Stat label="Mind" value={signed(c.mind)} />
      <Stat label="Strength" value={signed(c.strength)} />
    </div>
  )
}

export function DerivedRow({ c }: { c: Character }) {
  const { level, effortMax } = levelFor(c.txp)
  return (
    <div className="grid grid-cols-4 gap-2">
      <Stat label="Seviye" value={level} accent="text-gold" />
      <Stat label="AD" value={totalAd(c)} />
      <Stat label="Hız" value={speedOf(c)} accent={speedOf(c) < 5 ? 'text-ember' : ''} />
      <Stat label="Effort" value={`${c.effort}/${effortMax}`} />
    </div>
  )
}

export function DeadBadge({ c }: { c: Character }) {
  if (!isDead(c)) return null
  return <span className="rounded-md bg-blood px-2 py-0.5 text-xs font-bold tracking-wider uppercase">Öldü</span>
}
