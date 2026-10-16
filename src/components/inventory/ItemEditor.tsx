import { useState } from 'react'
import type { Character, Item } from '../../interfaces'
import { CATEGORY_LABELS } from '../../data/items'
import { autoPlace } from '../../services/inventory'
import { uid } from '../../services/storage'
import { ConfirmButton, Modal, Stepper, useToast } from '../ui'

const ZONE_LABELS = { hand: 'El', belt: 'Kemer', magic: 'Büyülü slot', backpack: 'Sırt çantası', ground: 'Yer' }

interface Props {
  item?: Item
  character: Character
  onClose: () => void
  onChange: (update: (c: Character) => Character) => void
}

export default function ItemEditor({ item, onClose, onChange }: Props) {
  const toast = useToast()
  const [draft, setDraft] = useState<Item | undefined>(item)
  if (!item || !draft) return <Modal open={false} onClose={onClose} title="">{null}</Modal>

  const patch = (p: Partial<Item>) => setDraft({ ...draft, ...p })
  const isArmor = draft.category === 'armor'
  const isShield = draft.name.toLowerCase().includes('shield')

  const save = () => {
    onChange((c) => ({
      ...c,
      inventory: c.inventory.map((i) => {
        if (i.id === item.id) return draft
        // Aynı anda yalnızca bir zırh giyilebilir
        if (draft.worn && i.worn) return { ...i, worn: false }
        return i
      }),
    }))
    toast('Eşya güncellendi')
    onClose()
  }

  const split = () => {
    const half = Math.floor(draft.quantity / 2)
    onChange((c) => {
      const inv = c.inventory.map((i) => (i.id === item.id ? { ...draft, quantity: draft.quantity - half } : i))
      return { ...c, inventory: autoPlace(inv, { ...draft, id: uid(), quantity: half, worn: false }, false) }
    })
    toast(`${half} adet ayrıldı`)
    onClose()
  }

  const remove = () => {
    onChange((c) => ({ ...c, inventory: c.inventory.filter((i) => i.id !== item.id) }))
    toast(`${item.name} silindi`)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Eşyayı düzenle">
      <div className="space-y-4">
        <p className="text-xs text-dust">
          {CATEGORY_LABELS[draft.category]} · {draft.size} slot · {ZONE_LABELS[draft.zone]}
          {draft.zone !== 'ground' && draft.zone !== 'magic' ? ` ${draft.index + 1}` : ''}
        </p>
        <div>
          <label className="label" htmlFor="it-name">İsim</label>
          <input id="it-name" className="input" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        {draft.stack > 1 && (
          <div className="flex items-center justify-between gap-3">
            <span className="label mb-0">Adet (en fazla {draft.stack})</span>
            <Stepper label="Adet" value={draft.quantity} min={1} max={draft.stack} onChange={(v) => patch({ quantity: v })} />
          </div>
        )}
        {isArmor && draft.adMax ? (
          <div className="flex items-center justify-between gap-3">
            <span className="label mb-0">AD (en fazla {draft.adMax})</span>
            <Stepper label="AD" value={draft.ad ?? 0} min={0} max={draft.adMax} onChange={(v) => patch({ ad: v })} />
          </div>
        ) : null}
        {isArmor && !isShield && (
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-ink/60 px-3 ring-1 ring-smoke">
            <span className="text-sm">Bu zırhı giy {draft.zone !== 'backpack' && <span className="text-dust">(sırt çantasında olmalı)</span>}</span>
            <input type="checkbox" className="h-5 w-5 accent-[#d4a548]" checked={!!draft.worn} disabled={draft.zone !== 'backpack'} onChange={(e) => patch({ worn: e.target.checked })} />
          </label>
        )}
        <div>
          <label className="label" htmlFor="it-notes">Notlar</label>
          <textarea id="it-notes" className="input min-h-20 py-2" value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Büyü etkisi, kullanım sayısı…" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {draft.quantity > 1 && <button className="btn-ghost" onClick={split}>Yığını böl</button>}
          <ConfirmButton className="btn-danger" onConfirm={remove}>Sil</ConfirmButton>
          <button className="btn-primary col-span-2" onClick={save}>Kaydet</button>
        </div>
      </div>
    </Modal>
  )
}
