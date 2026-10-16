import { useMemo, useState } from 'react'
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, pointerWithin, rectIntersection,
  useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import type { Character, Item, Zone } from '../../interfaces'
import { BACKPACK_ROW, SLOT_COUNTS } from '../../data/rules'
import { moveItem, speedOf } from '../../services/inventory'
import { useToast } from '../ui'
import { ItemTile } from './ItemTile'
import ItemEditor from './ItemEditor'
import AddItemModal from './AddItemModal'
import ItemInfo from './ItemInfo'

type SlotZone = Exclude<Zone, 'ground'>
const ZONES: { zone: SlotZone; title: string; hint: string; cols: number }[] = [
  { zone: 'hand', title: 'Eller', hint: 'Kullanılan eşya · yığın yok', cols: 2 },
  { zone: 'belt', title: 'Kemer', hint: 'Hızlı erişim', cols: 4 },
  { zone: 'magic', title: 'Büyülü Eşya', hint: 'Sadece giyilebilir', cols: 3 },
  { zone: 'backpack', title: 'Sırt Çantası', hint: 'Yaralar burayı doldurur', cols: BACKPACK_ROW },
]

const slotId = (zone: Zone, index: number) => `${zone}:${index}`
const parseSlot = (id: string) => {
  const [zone, index] = id.split(':')
  return { zone: zone as Zone, index: Number(index) }
}

// Önce işaretçinin altındaki slot; dokunmatikte kenarlarda kalırsa en çok örtüşen slot.
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  return hits.length ? hits : rectIntersection(args)
}

interface Props {
  character: Character
  onChange: (update: (c: Character) => Character) => void
}

export default function InventoryBoard({ character, onChange }: Props) {
  const toast = useToast()
  const inventory = character.inventory
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [overlaySize, setOverlaySize] = useState({ width: 80, height: 80 })

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Mobilde kısa basılı tutunca sürükleme başlar; böylece sayfa kaydırma bozulmaz.
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const movingId = activeId ?? selectedId
  const moving = inventory.find((i) => i.id === movingId) ?? null

  /** Taşınan eşya için her slotun geçerli olup olmadığı (görsel ipucu). */
  const validSlots = useMemo(() => {
    const set = new Set<string>()
    if (!moving) return set
    for (const { zone } of ZONES) {
      for (let i = 0; i < SLOT_COUNTS[zone]; i++) if (moveItem(inventory, moving.id, zone, i).ok) set.add(slotId(zone, i))
    }
    return set
  }, [moving, inventory])

  const tryMove = (itemId: string, zone: Zone, index: number) => {
    const result = moveItem(inventory, itemId, zone, index)
    if (!result.ok) return toast(result.reason, 'error')
    if (result.inventory !== inventory) onChange((c) => ({ ...c, inventory: result.inventory }))
    if (result.message) toast(result.message)
    setSelectedId(null)
  }

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id))
    const rect = e.active.rect.current.initial
    if (rect) setOverlaySize({ width: rect.width, height: rect.height })
    setSelectedId(null)
    navigator.vibrate?.(15)
  }
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!e.over) return
    const { zone, index } = parseSlot(String(e.over.id))
    tryMove(String(e.active.id), zone, index)
  }

  // Dokun-taşı: önce eşyaya, sonra hedefe dokun. Aynı eşyaya tekrar dokunmak düzenleyiciyi açar.
  const onItemTap = (item: Item) => {
    if (!selectedId) return setSelectedId(item.id)
    if (selectedId === item.id) {
      setEditingId(item.id)
      return setSelectedId(null)
    }
    if (item.zone === 'ground') return setSelectedId(item.id)
    tryMove(selectedId, item.zone, item.index)
  }
  const onSlotTap = (zone: Zone, index: number) => selectedId && tryMove(selectedId, zone, index)

  const toggleWound = (index: number) =>
    onChange((c) => ({ ...c, wounds: c.wounds.includes(index) ? c.wounds.filter((w) => w !== index) : [...c.wounds, index] }))

  const active = inventory.find((i) => i.id === activeId)
  const selected = inventory.find((i) => i.id === selectedId)
  const editing = inventory.find((i) => i.id === editingId)
  const ground = inventory.filter((i) => i.zone === 'ground').sort((a, b) => a.index - b.index)
  const used = inventory.filter((i) => i.zone === 'backpack').reduce((s, i) => s + i.size, 0)

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-dust">
            <span className="hidden sm:inline">Sürükle-bırak ya da </span>
            <span className="sm:hidden">Basılı tutup sürükle ya da </span>
            eşyaya dokun → hedef slota dokun. Tekrar dokun: düzenle.
          </p>
          <button className="btn-primary min-h-10 text-sm" onClick={() => setAdding(true)}>+ Eşya Ekle</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {ZONES.slice(0, 3).map((z) => (
            <ZoneGrid key={z.zone} {...z} items={inventory} wounds={[]} moving={moving} validSlots={validSlots} selectedId={selectedId} onItemTap={onItemTap} onSlotTap={onSlotTap} onToggleWound={toggleWound} />
          ))}
          <div className="lg:col-span-2">
            <ZoneGrid
              {...ZONES[3]}
              hint={`${used}/10 slot dolu · ${character.wounds.length} yara · Hız ${speedOf(character)}`}
              items={inventory}
              wounds={character.wounds}
              moving={moving}
              validSlots={validSlots}
              selectedId={selectedId}
              onItemTap={onItemTap}
              onSlotTap={onSlotTap}
              onToggleWound={toggleWound}
            />
          </div>
        </div>

        <GroundZone items={ground} moving={moving} selectedId={selectedId} onItemTap={onItemTap} onTap={() => onSlotTap('ground', 0)} />
      </div>

      {selected && !activeId && (
        <div className="above-badge animate-pop fixed inset-x-3 z-40 rounded-2xl border border-gold/40 bg-coal/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur sm:inset-x-auto sm:left-6 sm:w-[32rem]">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-sm">
              <span className="font-bold text-gold">{selected.name}</span>
              <span className="text-xs text-dust"> · hedef slota dokun</span>
              <ItemInfo name={selected.name} category={selected.category} compact />
            </p>
            <button className="btn-ghost min-h-9 shrink-0 px-3 text-sm" onClick={() => setSelectedId(null)} aria-label="Seçimi iptal et">✕</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="btn-ghost min-h-10 text-sm" onClick={() => { setEditingId(selected.id); setSelectedId(null) }}>Düzenle / bilgi</button>
            {selected.zone !== 'ground' ? (
              <button className="btn-ghost min-h-10 text-sm" onClick={() => tryMove(selected.id, 'ground', 0)}>Yere bırak</button>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' }}>
        {active ? (
          <div style={overlaySize}>
            <ItemTile item={active} overlay />
          </div>
        ) : null}
      </DragOverlay>

      <ItemEditor key={editingId ?? 'none'} item={editing} character={character} onClose={() => setEditingId(null)} onChange={onChange} />
      <AddItemModal open={adding} onClose={() => setAdding(false)} onChange={onChange} />
    </DndContext>
  )
}

interface ZoneProps {
  zone: SlotZone
  title: string
  hint: string
  cols: number
  items: Item[]
  wounds: number[]
  moving: Item | null
  validSlots: Set<string>
  selectedId: string | null
  onItemTap: (item: Item) => void
  onSlotTap: (zone: Zone, index: number) => void
  onToggleWound: (index: number) => void
}

function ZoneGrid({ zone, title, hint, cols, items, wounds, moving, validSlots, selectedId, onItemTap, onSlotTap, onToggleWound }: ZoneProps) {
  const count = SLOT_COUNTS[zone]
  const zoneItems = items.filter((i) => i.zone === zone)
  const isBackpack = zone === 'backpack'
  // Sırt çantasında her eşya satırının altında, sütunlarla hizalı bir yara şeridi bulunur.
  const pos = (index: number) => {
    const row = Math.floor(index / cols) + 1
    return { col: (index % cols) + 1, row: isBackpack ? row * 2 - 1 : row }
  }
  const rows = Math.ceil(count / cols)
  return (
    <section className="card p-3 sm:p-4">
      <header className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="heading text-base">{title}</h3>
        <span className="truncate text-[11px] text-dust">{hint}</span>
      </header>
      <div
        className={`grid gap-1.5 sm:gap-2 ${isBackpack ? '[--row:5rem] sm:[--row:6rem]' : 'auto-rows-[5rem] sm:auto-rows-[6rem]'}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: isBackpack ? Array.from({ length: rows }, () => 'var(--row) 1.75rem').join(' ') : undefined,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <DropCell
            key={i}
            id={slotId(zone, i)}
            label={`${title} ${i + 1}`}
            showNumber={isBackpack}
            style={{ gridColumn: pos(i).col, gridRow: pos(i).row }}
            dragging={!!moving}
            valid={validSlots.has(slotId(zone, i))}
            onTap={() => onSlotTap(zone, i)}
          />
        ))}
        {zoneItems.map((item) => (
          <ItemTile
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onTap={onItemTap}
            style={{ gridColumn: `${pos(item.index).col} / span ${item.size}`, gridRow: pos(item.index).row }}
          />
        ))}
        {isBackpack &&
          Array.from({ length: count }, (_, i) => {
            const wounded = wounds.includes(i)
            const { col, row } = pos(i)
            return [
              wounded && (
                <div
                  key={`t${i}`}
                  className="pointer-events-none z-20 rounded-xl bg-[repeating-linear-gradient(135deg,rgb(179_38_30/0.35)_0_6px,transparent_6px_12px)] ring-2 ring-blood/80"
                  style={{ gridColumn: col, gridRow: row }}
                />
              ),
              <button
                key={`w${i}`}
                type="button"
                onClick={() => onToggleWound(i)}
                style={{ gridColumn: col, gridRow: row + 1 }}
                className={`flex items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition ${wounded ? 'bg-blood text-bone' : 'bg-ink/60 text-dust/50 ring-1 ring-smoke/60 hover:text-blood'}`}
                aria-label={`Slot ${i + 1} yara ${wounded ? 'kaldır' : 'ekle'}`}
                aria-pressed={wounded}
              >
                <span aria-hidden="true">🩸</span>{wounded ? 'Yara' : i + 1}
              </button>,
            ]
          })}
      </div>
    </section>
  )
}

function DropCell({ id, label, showNumber, style, dragging, valid, onTap }: { id: string; label: string; showNumber: boolean; style: React.CSSProperties; dragging: boolean; valid: boolean; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const tone = isOver
    ? valid ? 'border-gold bg-gold/20 scale-[1.03]' : 'border-blood bg-blood/20'
    : dragging && valid ? 'border-gold/60 bg-gold/5' : 'border-smoke/70 bg-ink/40'
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      style={style}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-150 ${tone}`}
      aria-label={`Slot: ${label}`}
    >
      {showNumber && <span className="absolute top-1 left-1.5 text-[10px] font-bold text-dust/50">{label.split(' ').pop()}</span>}
    </button>
  )
}

function GroundZone({ items, moving, selectedId, onItemTap, onTap }: { items: Item[]; moving: Item | null; selectedId: string | null; onItemTap: (i: Item) => void; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId('ground', 0) })
  return (
    <section
      ref={setNodeRef}
      onClick={(e) => e.target === e.currentTarget && onTap()}
      className={`card border-2 border-dashed p-3 transition sm:p-4 ${isOver ? 'border-gold bg-gold/10' : moving && moving.zone !== 'ground' ? 'border-gold/40' : 'border-smoke/70'}`}
    >
      <header className="pointer-events-none mb-2 flex items-baseline justify-between">
        <h3 className="heading text-base">Yer / Depo</h3>
        <span className="text-[11px] text-dust">Taşınmayan eşyalar · buraya bırak</span>
      </header>
      {items.length === 0 ? (
        <p className="pointer-events-none py-4 text-center text-sm text-dust/60">Boş</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="h-20 sm:h-24" style={{ width: `${Math.min(item.size, 2) * 5}rem` }}>
              <ItemTile item={item} selected={selectedId === item.id} onTap={onItemTap} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
