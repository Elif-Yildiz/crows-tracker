import type { Character, Item, ItemTemplate, Zone } from '../interfaces'
import { BACKPACK_ROW, BASE_SPEED, SLOT_COUNTS } from '../data/rules'
import { uid } from './storage'

// Envanter kuralları (Crows Rules Booklet → Inventory Slots):
// - Çok slotlu eşyalar aynı türde ve yan yana slotlarda olmalı.
// - Elde yığın tutulamaz; her el yalnızca 1 eşya tutar.
// - Büyülü eşya slotlarına sadece "wearable" eşyalar konur.
// - Aynı isimli eşyalar yığın sınırına kadar tek slotta birleşebilir.

export type MoveResult = { ok: true; inventory: Item[]; message?: string } | { ok: false; reason: string }

export function itemFromTemplate(t: ItemTemplate, quantity = 1): Item {
  return {
    id: uid(),
    name: t.name,
    category: t.category,
    stack: t.stack,
    size: t.size,
    quantity: Math.min(quantity, t.stack),
    wearable: !!t.wearable,
    ad: t.ad,
    adMax: t.ad,
    notes: t.description ?? '',
    zone: 'ground',
    index: 0,
  }
}

export const slotIndices = (item: Pick<Item, 'index' | 'size'>, index = item.index) =>
  Array.from({ length: item.size }, (_, i) => index + i)

export function itemAt(inventory: Item[], zone: Zone, index: number): Item | undefined {
  return inventory.find((it) => it.zone === zone && slotIndices(it).includes(index))
}

/** Eşyanın hedef konuma yerleşip yerleşemeyeceğini kontrol eder; hata varsa sebebini döner. */
export function placementError(inventory: Item[], item: Item, zone: Zone, index: number, ignore: string[] = []): string | null {
  if (zone === 'ground') return null
  const count = SLOT_COUNTS[zone]
  if (index < 0 || index + item.size > count) return 'Eşya buraya sığmıyor'
  if (zone === 'magic' && !item.wearable) return 'Sadece giyilebilir büyülü eşyalar'
  if (zone === 'magic' && item.size > 1) return 'Büyülü slot tek eşya alır'
  if (zone === 'backpack' && Math.floor(index / BACKPACK_ROW) !== Math.floor((index + item.size - 1) / BACKPACK_ROW))
    return 'Slotlar aynı sırada yan yana olmalı'
  for (const i of slotIndices(item, index)) {
    const other = itemAt(inventory, zone, i)
    if (other && other.id !== item.id && !ignore.includes(other.id)) return 'Slot dolu'
  }
  return null
}

function nextGroundIndex(inventory: Item[]) {
  return inventory.filter((i) => i.zone === 'ground').reduce((m, i) => Math.max(m, i.index + 1), 0)
}

/** Sürükle-bırak / dokun-taşı işlemlerinin tek giriş noktası. */
export function moveItem(inventory: Item[], itemId: string, zone: Zone, index: number): MoveResult {
  const item = inventory.find((i) => i.id === itemId)
  if (!item) return { ok: false, reason: 'Eşya bulunamadı' }
  if (item.zone === zone && item.index === index) return { ok: true, inventory }
  if (zone === 'ground') index = nextGroundIndex(inventory)

  const targets = zone === 'ground' ? [] : slotIndices(item, index)
  const occupants = [...new Set(targets.map((i) => itemAt(inventory, zone, i)).filter((o): o is Item => !!o && o.id !== item.id))]

  // 1) Aynı isimli yığına birleştir
  if (occupants.length === 1 && zone !== 'hand') {
    const target = occupants[0]
    if (target.name === item.name && target.stack > 1 && target.quantity < target.stack) {
      const moved = Math.min(item.quantity, target.stack - target.quantity)
      const rest = item.quantity - moved
      const inv = inventory
        .map((i) => (i.id === target.id ? { ...i, quantity: i.quantity + moved } : i.id === item.id ? { ...i, quantity: rest } : i))
        .filter((i) => i.quantity > 0)
      return { ok: true, inventory: inv, message: `${moved} adet ${item.name} yığına eklendi` }
    }
  }

  // 2) Boş slota taşı (ele yığın konursa 1 tanesi ayrılır)
  const err = placementError(inventory, item, zone, index)
  if (!err) {
    if (zone === 'hand' && item.quantity > 1) {
      const single: Item = { ...item, id: uid(), quantity: 1, zone, index, worn: false }
      return {
        ok: true,
        inventory: [...inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)), single],
        message: 'Elde yığın tutulamaz: 1 adet ele alındı',
      }
    }
    return { ok: true, inventory: inventory.map((i) => (i.id === item.id ? { ...i, zone, index, worn: zone === 'backpack' ? i.worn : false } : i)) }
  }

  // 3) Tek bir eşyayla yer değiştir
  if (occupants.length === 1 && err === 'Slot dolu' && item.zone !== 'ground') {
    const other = occupants[0]
    const movedItem = { ...item, zone, index }
    const otherIndex = item.index
    const swapped = inventory.map((i) => (i.id === item.id ? movedItem : i))
    const otherErr = placementError(swapped, other, item.zone, otherIndex, [other.id])
    const myErr = placementError(inventory, item, zone, index, [other.id])
    if (!myErr && !otherErr && !(item.zone === 'hand' && other.quantity > 1)) {
      return {
        ok: true,
        inventory: swapped.map((i) => (i.id === other.id ? { ...i, zone: item.zone, index: otherIndex, worn: false } : i)),
        message: `${item.name} ↔ ${other.name}`,
      }
    }
  }
  return { ok: false, reason: err ?? 'Buraya taşınamaz' }
}

/** Eşyayı mümkün olan ilk uygun yere koyar: mevcut yığın → sırt çantası → kemer → yer. */
export function autoPlace(inventory: Item[], item: Item, merge = true): Item[] {
  let inv = [...inventory]
  let remaining = item.quantity
  for (const s of !merge ? [] : inv.filter((i) => i.name === item.name && i.zone !== 'hand' && i.zone !== 'ground' && i.quantity < i.stack)) {
    const add = Math.min(remaining, s.stack - s.quantity)
    inv = inv.map((i) => (i.id === s.id ? { ...i, quantity: i.quantity + add } : i))
    remaining -= add
    if (!remaining) return inv
  }
  const toPlace = { ...item, quantity: remaining }
  const zones: Zone[] = item.wearable ? ['magic', 'backpack', 'belt'] : ['backpack', 'belt']
  for (const zone of zones) {
    for (let idx = 0; idx < SLOT_COUNTS[zone as Exclude<Zone, 'ground'>]; idx++) {
      if (!placementError(inv, toPlace, zone, idx)) return [...inv, { ...toPlace, zone, index: idx }]
    }
  }
  return [...inv, { ...toPlace, zone: 'ground', index: nextGroundIndex(inv) }]
}

// ---- Türetilmiş istatistikler ----

export function speedOf(c: Character) {
  const penalty = c.wounds.filter((w) => itemAt(c.inventory, 'backpack', w)).length
  return Math.max(0, BASE_SPEED - penalty)
}

/** AD kaynakları: elde tutulan kalkanlar ve sırt çantasında giyili zırh. */
export function adSources(c: Character) {
  return c.inventory.filter(
    (i) => i.category === 'armor' && i.adMax && ((i.zone === 'hand' && i.name.toLowerCase().includes('shield')) || (i.zone === 'backpack' && i.worn)),
  )
}

export const totalAd = (c: Character) => adSources(c).reduce((s, i) => s + (i.ad ?? 0), 0)

export const isDead = (c: Character) => c.wounds.length >= SLOT_COUNTS.backpack

/** Hasar: önce AD (kalkan → zırh), sonra Stamina, sonra yara. Delici hasar AD'yi atlar. */
export function applyDamage(c: Character, amount: number, piercing: boolean): { character: Character; log: string } {
  let dmg = amount
  let inventory = c.inventory
  const parts: string[] = []
  if (!piercing) {
    const sources = adSources(c).sort((a) => (a.zone === 'hand' ? -1 : 1))
    for (const s of sources) {
      if (!dmg) break
      const absorbed = Math.min(dmg, s.ad ?? 0)
      if (!absorbed) continue
      dmg -= absorbed
      inventory = inventory.map((i) => (i.id === s.id ? { ...i, ad: (i.ad ?? 0) - absorbed } : i))
      parts.push(`${s.name} ${absorbed} AD`)
    }
  }
  const stam = Math.min(dmg, c.stamina)
  dmg -= stam
  if (stam) parts.push(`${stam} Stamina`)
  const wounds = [...c.wounds]
  // Yaralar önce boş slotlara, sonra dolu slotlara yerleşir (oyuncu sonradan değiştirebilir).
  const free = Array.from({ length: SLOT_COUNTS.backpack }, (_, i) => i).filter((i) => !wounds.includes(i))
  free.sort((a, b) => Number(!!itemAt(inventory, 'backpack', a)) - Number(!!itemAt(inventory, 'backpack', b)) || a - b)
  const newWounds = free.slice(0, dmg)
  wounds.push(...newWounds)
  if (newWounds.length) parts.push(`${newWounds.length} yara`)
  return {
    character: { ...c, inventory, stamina: c.stamina - stam, wounds },
    log: `${amount}${piercing ? 'P' : ''} hasar → ${parts.join(', ') || 'etkisiz'}`,
  }
}

/** Dinlenme: Stamina dolar, 1 yara iyileşir, Effort yenilenir. */
export function rest(c: Character, effortMax: number): Character {
  return { ...c, stamina: c.staminaMax, effort: effortMax, wounds: c.wounds.slice(0, -1) }
}
