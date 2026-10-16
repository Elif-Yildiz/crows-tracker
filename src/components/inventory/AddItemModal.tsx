import { useMemo, useState } from 'react'
import type { Character, ItemCategory, ItemTemplate } from '../../interfaces'
import { CATEGORY_LABELS, ITEM_CATALOG } from '../../data/items'
import { autoPlace, itemFromTemplate } from '../../services/inventory'
import { Modal, Stepper, useToast } from '../ui'
import { CATEGORY_STYLE } from './ItemTile'

interface Props {
  open: boolean
  onClose: () => void
  onChange: (update: (c: Character) => Character) => void
}

export default function AddItemModal({ open, onClose, onChange }: Props) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [custom, setCustom] = useState<ItemTemplate>({ name: '', category: 'gear', stack: 1, size: 1 })
  const [qty, setQty] = useState(1)

  const results = useMemo(
    () => ITEM_CATALOG.filter((t) => (category === 'all' || t.category === category) && t.name.toLowerCase().includes(query.toLowerCase())),
    [query, category],
  )

  const add = (t: ItemTemplate, quantity = 1) => {
    onChange((c) => {
      let inv = c.inventory
      let left = quantity
      while (left > 0) {
        const item = itemFromTemplate(t, left)
        inv = autoPlace(inv, item)
        left -= item.quantity
      }
      return { ...c, inventory: inv }
    })
    toast(`${t.name} eklendi`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Eşya ekle">
      <div className="space-y-4">
        <input className="input" placeholder="Ara: torch, sword, potion…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {(['all', ...Object.keys(CATEGORY_LABELS)] as const).map((k) => (
            <button
              key={k}
              onClick={() => setCategory(k as ItemCategory | 'all')}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === k ? 'bg-bone text-ink' : 'bg-ash text-dust'}`}
            >
              {k === 'all' ? 'Tümü' : CATEGORY_LABELS[k]}
            </button>
          ))}
        </div>
        <ul className="max-h-64 divide-y divide-smoke/60 overflow-y-auto rounded-xl ring-1 ring-smoke">
          {results.map((t) => (
            <li key={t.name}>
              <button className="flex min-h-12 w-full items-center gap-3 px-3 text-left hover:bg-ash" onClick={() => add(t)}>
                <span className={`h-6 w-1 rounded ${CATEGORY_STYLE[t.category].bar}`} />
                <span className="flex-1 text-sm font-medium">{t.name}</span>
                <span className="text-xs text-dust">
                  {t.size > 1 && `${t.size} slot · `}{t.stack > 1 && `yığın ${t.stack}`}{t.ad ? ` · AD ${t.ad}` : ''}
                </span>
                <span className="text-gold">+</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="p-4 text-center text-sm text-dust">Sonuç yok — aşağıdan özel eşya ekle.</li>}
        </ul>

        <details className="rounded-xl bg-ink/60 p-3 ring-1 ring-smoke">
          <summary className="cursor-pointer text-sm font-semibold">Özel eşya / hazine</summary>
          <div className="mt-3 space-y-3">
            <input className="input" placeholder="İsim" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <select className="input" value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value as ItemCategory })} aria-label="Kategori">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="label mb-0">Slot</span><Stepper label="Slot" value={custom.size} min={1} max={4} onChange={(v) => setCustom({ ...custom, size: v })} /></div>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="label mb-0">Yığın sınırı</span><Stepper label="Yığın" value={custom.stack} min={1} max={250} onChange={(v) => setCustom({ ...custom, stack: v })} /></div>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="label mb-0">Adet</span><Stepper label="Adet" value={qty} min={1} max={250} onChange={setQty} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[#d4a548]" checked={!!custom.wearable} onChange={(e) => setCustom({ ...custom, wearable: e.target.checked })} />
              Giyilebilir büyülü eşya
            </label>
            <button
              className="btn-primary w-full"
              disabled={!custom.name.trim()}
              onClick={() => { add({ ...custom, name: custom.name.trim() }, qty); setCustom({ ...custom, name: '' }); setQty(1) }}
            >
              Ekle
            </button>
          </div>
        </details>
        <p className="text-xs text-dust">Eklenen eşyalar önce mevcut yığınlara, sonra boş sırt çantası/kemer slotlarına, yer yoksa Yer/Depo alanına konur.</p>
      </div>
    </Modal>
  )
}
