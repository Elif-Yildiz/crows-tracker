import type { ItemTemplate } from '../interfaces'

// Kaynak: Crows Inventory Cards (Playtest 3). stack = tek slotta taşınabilecek adet, size = kapladığı slot.
const w = (name: string, stack: number, size = 1, price?: number): ItemTemplate => ({ name, category: 'weapon', stack, size, price })
const g = (name: string, stack: number, size = 1, price?: number): ItemTemplate => ({ name, category: 'gear', stack, size, price })
const c = (name: string, stack: number, price?: number): ItemTemplate => ({ name, category: 'consumable', stack, size: 1, price })

export const ITEM_CATALOG: ItemTemplate[] = [
  // Silahlar
  w('Knife', 2, 1, 10), w('Stiletto', 2, 1, 10), w('Handaxe', 2, 1, 10), w('Hammer', 2, 1, 10),
  w('Sword', 1, 1, 12), w('Mace', 1, 1, 12), w('Axe', 1, 1, 12), w('Spear', 1, 1, 12), w('Shortbow', 1, 1),
  w('Flail', 1, 2), w('Maul', 1, 2), w('Glaive', 1, 2), w('Greatsword', 1, 2), w('Halberd', 1, 2),
  w('Greataxe', 1, 2), w('Pike', 1, 2), w('Warpick', 1, 2), w('Longbow', 1, 2), w('Crossbow', 1, 2),
  g('Quiver of 20 Arrows', 1, 1, 5), g('Case of 20 Crossbow Bolts', 1, 1, 5),
  // Zırhlar
  { name: 'Shield', category: 'armor', stack: 1, size: 1, ad: 5, price: 100 },
  { name: 'Light Armor', category: 'armor', stack: 1, size: 2, ad: 5 },
  { name: 'Medium Armor', category: 'armor', stack: 1, size: 3, ad: 10 },
  { name: 'Heavy Armor', category: 'armor', stack: 1, size: 4, ad: 15 },
  // Tüketilebilir
  c('Ration', 6, 1), c('Hearty Ration', 6), c('Animal Feed', 6, 1), c('Healing Potion', 5), c('Greater Healing Potion', 5),
  c('Rage Potion', 5), c('Speed Potion', 5), c('Phasing Potion', 5), c('Acid Vial', 5, 25), c('Strong Acid Vial', 5, 300),
  c('Poison Vial', 5), c('Strong Poison', 5), c('Sleep Poison', 5), c('Truth Poison', 5), c('Oil Flask', 2, 5),
  c('Smoke Bomb', 2), c('Fire Bomb', 2), c('Force Bomb', 2), c('Demolition Bomb', 2), c('Weakening Gas Bomb', 2),
  c('Candle', 5), c('Chalk', 5), c('Torch', 2),
  // Eşyalar
  g('Coin Purse', 1, 1, 1), g('Rope', 1), g('11-Foot Pole', 1, 2, 5), g('Ladder', 1, 2, 30), g('Tent', 1, 2),
  g("Alchemist's Tools", 1, 1, 15), g("Blacksmith's Tools", 1, 1, 15), g("Cook's Utensils", 1), g('Surgical Kit', 1),
  g('Lantern', 2, 1, 25), g('Bear Trap', 1, 1, 15), g('Ball Bearings', 2, 1, 10), g('Bucket', 1, 1, 1), g('Caltrops', 2),
  g('Card Deck', 5), g('Chain', 1), g('Cold Weather Gear', 1), g('Compass', 3), g('Crowbar', 1), g('Glue Pot', 2),
  g('Grappling Hook', 1), g('Holy Symbol', 3), g('Journal', 1, 1, 2), g('Lockpick Set', 1), g('Lore Book', 1),
  g("Merchant's Scales", 1), g("Miner's Pick", 1), g('Mirror', 2), g('Monster Trap', 1), g('Net', 1), g('Padlock', 3),
  g('Pitons', 2), g('Pot', 1), g('Quill and Inkpot', 5), g('Shovel', 1), g('Soap', 3), g('Spyglass', 2), g('String', 1),
  g('Whistle', 5), g('Magnifying Glass', 1), g('Musical Instrument', 1),
  // Büyülü
  { name: 'Alteration Stone', category: 'magic', stack: 1, size: 1 },
  { name: 'Plague Mask', category: 'magic', stack: 1, size: 1, wearable: true },
  { name: 'Death Ring', category: 'magic', stack: 10, size: 1, wearable: true },
  { name: 'Magic Ring', category: 'magic', stack: 10, size: 1, wearable: true },
  { name: 'Feather Poulaines', category: 'magic', stack: 1, size: 1, wearable: true },
  { name: 'Boom Wand', category: 'magic', stack: 2, size: 1 },
  { name: 'Hurling Wand', category: 'magic', stack: 2, size: 1 },
  { name: 'Spider Box', category: 'magic', stack: 1, size: 1 },
  { name: 'Chicken Bag', category: 'magic', stack: 1, size: 1 },
  // Hazine
  { name: 'Gem', category: 'treasure', stack: 5, size: 1 },
  { name: 'Creature Part', category: 'treasure', stack: 5, size: 1 },
  { name: 'Iron Bar', category: 'treasure', stack: 1, size: 1 },
]

export function findTemplate(name: string): ItemTemplate {
  if (name.startsWith('Spellbook:')) return { name, category: 'spellbook', stack: 1, size: 1 }
  return ITEM_CATALOG.find((t) => t.name.toLowerCase() === name.toLowerCase())
    ?? { name, category: 'gear', stack: 1, size: 1 }
}

export const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Silah', armor: 'Zırh', gear: 'Eşya', consumable: 'Tüketilebilir',
  magic: 'Büyülü', spellbook: 'Büyü Kitabı', treasure: 'Hazine',
}
