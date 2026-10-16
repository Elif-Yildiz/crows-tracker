// Kaynak: Crows Rules & Character Booklet (Playtest 3)

export const SLOT_COUNTS = { hand: 2, belt: 4, magic: 3, backpack: 10 } as const
export const BACKPACK_ROW = 5
export const BASE_SPEED = 5

/** Karakter seviyesi tablosu: gereken TXP ve maksimum Effort. */
export const LEVELS = [
  { level: 1, txp: 0, effort: 2 },
  { level: 2, txp: 100, effort: 2 },
  { level: 3, txp: 500, effort: 2 },
  { level: 4, txp: 1250, effort: 3 },
  { level: 5, txp: 2250, effort: 3 },
  { level: 6, txp: 3500, effort: 3 },
  { level: 7, txp: 5000, effort: 4 },
  { level: 8, txp: 8000, effort: 4 },
  { level: 9, txp: 15000, effort: 4 },
  { level: 10, txp: 30000, effort: 5 },
]

export function levelFor(txp: number) {
  let current = LEVELS[0]
  for (const l of LEVELS) if (txp >= l.txp) current = l
  // 10. seviyeden sonra her 30.000 TXP bir seviye daha
  const extra = txp >= 60000 ? Math.floor((txp - 30000) / 30000) : 0
  const next = LEVELS.find((l) => l.txp > txp)
  return { level: current.level + extra, effortMax: current.effort, nextTxp: next?.txp ?? (Math.floor(txp / 30000) + 1) * 30000 }
}

export const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1
