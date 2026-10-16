import type { Background, Character, Characteristic } from '../interfaces'
import { STARTING_EQUIPMENT } from '../data/backgrounds'
import { findTemplate } from '../data/items'
import { rollDie } from '../data/rules'
import { autoPlace, itemFromTemplate } from './inventory'
import { uid } from './storage'

export interface CharacterDraft {
  playerName: string
  name: string
  feature: string
  background: Background
  agility: number
  mind: number
  strength: number
  expertises: string[]
  gold: number
}

/** "İsim:adet" biçimindeki ekipman listesini envantere yerleştirir. */
export function buildInventory(equipment: string[]) {
  return equipment.reduce((inv, entry) => {
    const [name, qty] = entry.split(':')
    const template = findTemplate(name)
    let left = Number(qty ?? 1)
    while (left > 0) {
      const item = itemFromTemplate(template, left)
      inv = autoPlace(inv, item)
      left -= item.quantity
    }
    return inv
  }, [] as Character['inventory'])
}

export function createFromDraft(gameId: string, d: CharacterDraft): Character {
  const inventory = buildInventory([...STARTING_EQUIPMENT, ...d.background.equipment])
  // Giyilebilecek ilk zırhı otomatik giy
  const armor = inventory.find((i) => i.category === 'armor' && !i.name.toLowerCase().includes('shield') && i.zone === 'backpack')
  if (armor) armor.worn = true
  const now = Date.now()
  return {
    id: uid(),
    gameId,
    playerName: d.playerName.trim(),
    name: d.name.trim(),
    feature: d.feature.trim(),
    background: d.background.name,
    trait: d.background.trait,
    agility: d.agility,
    mind: d.mind,
    strength: d.strength,
    staminaMax: d.background.stamina,
    stamina: d.background.stamina,
    effort: 2,
    txp: 0,
    xpSpent: 0,
    expertises: d.expertises,
    gold: d.gold,
    notes: '',
    inventory,
    wounds: [],
    createdAt: now,
    updatedAt: now,
  }
}

/** Arka plan tablosu için 2d6 atar (alfabetik sıra = d6/d6 tablosu). */
export function rollBackgroundIndex() {
  const a = rollDie(6)
  const b = rollDie(6)
  return { dice: [a, b] as const, index: (a - 1) * 6 + (b - 1) }
}

export const roll3d6 = () => rollDie(6) + rollDie(6) + rollDie(6)

/** Seçilen karakteristik 2 olur, diğer ikisi (1, 0) veya (-1, 2) dağıtılır. */
export function characteristicOptions(primary: Characteristic) {
  const others = (['agility', 'mind', 'strength'] as Characteristic[]).filter((c) => c !== primary)
  return { primary, others }
}
