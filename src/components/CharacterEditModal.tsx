import { useState } from 'react'
import type { Character } from '../interfaces'
import { ALL_EXPERTISES } from '../data/backgrounds'
import { Modal, Stepper } from './ui'

interface Props {
  open: boolean
  c: Character
  onClose: () => void
  onSave: (c: Character) => void
}

export default function CharacterEditModal({ open, c, onClose, onSave }: Props) {
  const [d, setD] = useState(c)
  const toggle = (x: string) =>
    setD({ ...d, expertises: d.expertises.includes(x) ? d.expertises.filter((e) => e !== x) : [...d.expertises, x] })

  return (
    <Modal open={open} onClose={onClose} title="Karakteri düzenle">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (d.name.trim()) onSave(d) }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="ce-name">Karakter adı</label><input id="ce-name" className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="ce-player">Oyuncu</label><input id="ce-player" className="input" value={d.playerName} onChange={(e) => setD({ ...d, playerName: e.target.value })} /></div>
        </div>
        <div><label className="label" htmlFor="ce-feat">Ayırt edici özellik</label><input id="ce-feat" className="input" value={d.feature} onChange={(e) => setD({ ...d, feature: e.target.value })} /></div>
        <div><label className="label" htmlFor="ce-trait">Trait'ler</label><input id="ce-trait" className="input" value={d.trait} onChange={(e) => setD({ ...d, trait: e.target.value })} /></div>
        <div className="space-y-2">
          {(['agility', 'mind', 'strength'] as const).map((k) => (
            <div key={k} className="flex items-center justify-between">
              <span lang="en" className="label mb-0">{k}</span>
              <Stepper label={k} value={d[k]} min={-1} max={4} onChange={(v) => setD({ ...d, [k]: v })} />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="label mb-0">Maks. Stamina</span>
            <Stepper label="Maksimum Stamina" value={d.staminaMax} min={1} max={99} onChange={(v) => setD({ ...d, staminaMax: v, stamina: Math.min(d.stamina, v) })} />
          </div>
        </div>
        <div>
          <p className="label">Expertise'ler</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_EXPERTISES.map((x) => (
              <button type="button" key={x} onClick={() => toggle(x)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${d.expertises.includes(x) ? 'bg-gold text-ink' : 'bg-ash text-dust'}`}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary w-full">Kaydet</button>
      </form>
    </Modal>
  )
}
