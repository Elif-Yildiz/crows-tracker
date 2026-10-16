import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Item, ItemCategory } from '../../interfaces'

export const CATEGORY_STYLE: Record<ItemCategory, { bar: string; icon: string }> = {
  weapon: { bar: 'bg-blood', icon: '⚔' },
  armor: { bar: 'bg-sky-600', icon: '⛨' },
  gear: { bar: 'bg-dust', icon: '⚒' },
  consumable: { bar: 'bg-moss', icon: '⚗' },
  magic: { bar: 'bg-violet-500', icon: '✦' },
  spellbook: { bar: 'bg-indigo-400', icon: '📖' },
  treasure: { bar: 'bg-gold', icon: '◆' },
}

interface TileProps {
  item: Item
  selected?: boolean
  overlay?: boolean
  style?: CSSProperties
  onTap?: (item: Item) => void
}

/** Envanterdeki eşya kartı. Basılı tutarak/sürükleyerek taşınır, dokununca seçilir. */
export function ItemTile({ item, selected, overlay, style, onTap }: TileProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled: overlay })
  return (
    <button
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      type="button"
      style={style}
      onClick={() => onTap?.(item)}
      aria-label={`${item.name}${item.quantity > 1 ? `, ${item.quantity} adet` : ''}`}
      className={[
        'group relative z-10 flex h-full w-full touch-manipulation flex-col overflow-hidden rounded-xl border bg-gradient-to-b from-ash to-coal p-1.5 pl-2.5 text-left shadow-md transition select-none',
        selected ? 'border-gold ring-2 ring-gold/70' : 'border-smoke hover:border-dust/70',
        isDragging ? 'opacity-25' : '',
        overlay ? 'scale-105 rotate-2 cursor-grabbing border-gold shadow-2xl shadow-black/70' : 'cursor-grab',
      ].join(' ')}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${CATEGORY_STYLE[item.category].bar}`} />
      <span className="flex items-start justify-between gap-1">
        <span className="text-xs leading-none opacity-70" aria-hidden="true">{CATEGORY_STYLE[item.category].icon}</span>
        {item.stack > 1 && (
          <span className="rounded bg-ink/80 px-1 text-[10px] font-bold tabular-nums text-bone/90">
            {item.quantity}/{item.stack}
          </span>
        )}
      </span>
      <span className="mt-0.5 line-clamp-2 text-[11px] leading-tight font-semibold sm:text-xs">{item.name}</span>
      <span className="mt-auto flex flex-wrap gap-1">
        {item.adMax ? (
          <span className={`rounded px-1 text-[10px] font-bold ${item.ad ? 'bg-sky-900/80 text-sky-200' : 'bg-blood/60'}`}>AD {item.ad}/{item.adMax}</span>
        ) : null}
        {item.worn && <span className="rounded bg-gold/80 px-1 text-[10px] font-bold text-ink">Giyili</span>}
      </span>
    </button>
  )
}
