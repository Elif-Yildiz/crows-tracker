// Crows Tracker veri modelleri

export type Characteristic = 'agility' | 'mind' | 'strength'

/** Envanter bölgeleri: el, kemer, büyülü eşya, sırt çantası ve yer (slot dışı). */
export type Zone = 'hand' | 'belt' | 'magic' | 'backpack' | 'ground'

export type ItemCategory = 'weapon' | 'armor' | 'gear' | 'consumable' | 'magic' | 'spellbook' | 'treasure'

export interface ItemTemplate {
  name: string
  category: ItemCategory
  /** Tek slota sığabilecek en fazla adet. */
  stack: number
  /** Kapladığı slot sayısı (1-4). */
  size: number
  wearable?: boolean
  ad?: number
  price?: number
  description?: string
}

export interface Item {
  id: string
  name: string
  category: ItemCategory
  stack: number
  size: number
  quantity: number
  wearable: boolean
  /** Zırh / kalkan için mevcut ve maksimum AD. */
  ad?: number
  adMax?: number
  /** Giyilen zırh mı? (Sırt çantasındaki tek bir zırh giyilebilir.) */
  worn?: boolean
  notes: string
  zone: Zone
  /** Bölge içindeki ilk slotun indeksi. 'ground' için sıralama amaçlıdır. */
  index: number
}

export interface Character {
  id: string
  gameId: string
  playerName: string
  name: string
  feature: string
  background: string
  trait: string
  agility: number
  mind: number
  strength: number
  staminaMax: number
  stamina: number
  effort: number
  txp: number
  xpSpent: number
  expertises: string[]
  gold: number
  notes: string
  inventory: Item[]
  /** Yara içeren sırt çantası slotlarının indeksleri (0-9). */
  wounds: number[]
  createdAt: number
  updatedAt: number
}

export interface Game {
  id: string
  code: string
  name: string
  refName: string
  village: string
  /** Oyunu kuran cihazın anonim kullanıcı kimliği (silme/düzenleme yetkisi). */
  ownerUid: string
  createdAt: number
}

export interface StoreState {
  games: Game[]
  characters: Character[]
}

export interface Background {
  name: string
  description: string
  /** Seçeneklerden biri 2 olur; ['any'] tüm karakteristikleri kapsar. */
  characteristic: Characteristic[] | ['any']
  stamina: number
  trait: string
  expertises: string[]
  equipment: string[]
  extraGold?: number
}
