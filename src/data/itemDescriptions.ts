// Kaynak: Crows Inventory Cards (Public Playtest 3). Kart metinleri oyun terimleri bozulmasın diye
// orijinal dilinde tutulur. Satırlar "\n" ile ayrılır; fiyat ayrı alandadır.
// Kısaltmalar: A = Agility, S = Strength, M = Mind, RR = resistance roll, UD = usage die,
// DT = dungeon turn, dam = damage, P = piercing.

export interface ItemCardInfo {
  text: string
  price?: string
}

const weapon = (range: string, attack: string, t2: string, t3: string, qualities: string, price?: string): ItemCardInfo => ({
  text: `${range} · Attack ${attack}\n12-16: ${t2} dam · 17+: ${t3} dam\n${qualities}`,
  price,
})

export const ITEM_CARDS: Record<string, ItemCardInfo> = {
  // ---- Silahlar ----
  Knife: weapon('Melee 1 / Ranged 5', '2d10 + A or S', '2 + A or S', '4 + A or S', 'Slashing, Light, Disengage, Parry 2', '10 gc'),
  Stiletto: weapon('Melee 1 / Ranged 5', '2d10 + A or S', '2 + A or S', '5 + A or S', 'Stabbing, Light, Brutal', '10 gc'),
  Handaxe: weapon('Melee 1 / Ranged 5', '2d10 + A or S', '2 + A or S', '5 + A or S', 'Chopping, Light, Dismember', '10 gc'),
  Hammer: weapon('Melee 1 / Ranged 5', '2d10 + A or S', '2 + A or S', '4 + A or S', 'Bashing, Light, Pummeling', '10 gc'),
  Sword: weapon('Melee 1', '2d10 + S', '3 + S', '6 + S', 'Slashing, Disengage, Parry 4', '12 gc'),
  Mace: weapon('Melee 1', '2d10 + S', '3 + S', '6 + S', 'Bashing, Pummeling', '12 gc'),
  Axe: weapon('Melee 1', '2d10 + S', '3 + S', '7 + S', 'Chopping, Dismember', '12 gc'),
  Spear: weapon('Melee 1', '2d10 + S', '3 + S', '7 + S', 'Stabbing, Brutal', '12 gc'),
  Shortbow: weapon('Ranged 10', '2d10 + A', '2 + A', '4 + A', 'Bow, Cumbersome', '10 gc'),
  Greatsword: weapon('Melee 1', '2d10 + S', '4 + S', '8 + S', 'Slashing, Disengage, Parry 6', '15 gc'),
  Glaive: weapon('Melee 2', '2d10 + S', '3 + S', '6 + S', 'Slashing, Disengage, Parry 6', '15 gc'),
  Halberd: weapon('Melee 2', '2d10 + S', '3 + S', '7 + S', 'Chopping, Dismember', '15 gc'),
  Greataxe: weapon('Melee 1', '2d10 + S', '4 + S', '9 + S', 'Chopping, Dismember', '15 gc'),
  Pike: weapon('Melee 2', '2d10 + S', '3 + S', '7 + S', 'Stabbing, Brutal', '15 gc'),
  Warpick: weapon('Melee 1', '2d10 + S', '4 + S', '9 + S', 'Stabbing, Brutal', '15 gc'),
  Longbow: weapon('Ranged 20', '2d10 + A', '3 + A', '6 + A', 'Bow', '12 gc'),
  Crossbow: weapon('Ranged 15', '2d10 + A', '4 + A', '8 + A', 'Bow, Reload', '15 gc'),
  'Quiver of 20 Arrows': { text: 'Ammunition for shortbows and longbows.', price: '5 gc' },
  'Case of 20 Crossbow Bolts': { text: 'Ammunition for crossbows.', price: '5 gc' },

  // ---- Zırhlar ----
  Shield: { text: 'Armor · AD 5\nWield in a hand slot to use its AD.', price: '100 gc' },
  'Light Armor': { text: 'Armor · AD 5\nOccupies 2 slots. Choose one suit in your backpack to wear.', price: '200 gc' },
  'Medium Armor': { text: 'Armor · AD 10\nOccupies 3 slots. Choose one suit in your backpack to wear.', price: '400 gc' },
  'Heavy Armor': { text: 'Armor · AD 15\nOccupies 4 slots. Choose one suit in your backpack to wear.', price: '600 gc' },

  // ---- Tüketilebilir ----
  Ration: { text: "A day's worth of food. Can be consumed to avoid starvation and get the benefits of a rest." },
  'Hearty Ration': { text: "A hearty day's worth of food. Can be consumed to avoid starvation and get the benefits of a rest." },
  'Animal Feed': { text: "A day's worth of food for a pet. Must be consumed during a rest to get the benefit of resting.", price: '1 gc' },
  'Healing Potion': {
    text: 'Maneuver: Consume to regain 1d6 Stamina or remove 1 wound if Stamina is already at maximum.\nYou can remove this from a belt slot and consume it in one maneuver.',
    price: '100 gc',
  },
  'Greater Healing Potion': {
    text: 'Maneuver: Consume to regain 2d6 Stamina or remove 2 wounds if Stamina is already at maximum.\nYou can remove this from a belt slot and consume it in one maneuver.',
    price: '500 gc',
  },
  'Rage Potion': {
    text: 'Maneuver: Consume to gain +5 AD and deal an additional 2 damage with melee attacks. Lasts as long as you keep making attacks against creatures each round.',
  },
  'Speed Potion': {
    text: 'Maneuver: Consume to increase your speed by 1.\nYou can remove this from a belt slot and consume it in one maneuver.',
  },
  'Phasing Potion': {
    text: 'Maneuver: Consume to gain the ability to move through walls and other objects for 2d6 combat rounds. If you stop moving inside an object, you take 1d10 P dam and are shunted out where you entered.\nYou can remove this from a belt slot and consume it in one maneuver.',
    price: '1,000 gc',
  },
  'Acid Vial': {
    text: 'Maneuver: Pouring the vial onto a surface destroys up to 1 cubic foot of mundane matter.\nAction: Make a ranged 5 attack with it using Agility.\n12-16: 4 + A dam · 17+: 8 + A dam',
    price: '25 gc',
  },
  'Strong Acid Vial': {
    text: 'Maneuver: Pouring the vial onto a surface destroys up to 5 cubic feet of mundane matter.\nAction: Make a ranged 5 attack with it using Agility.\n12-16: 7 + A dam · 17+: 14 + A dam',
    price: '300 gc',
  },
  'Poison Vial': {
    text: "Maneuver: Apply to a weapon or 1 ammo. The next time it deals damage to a creature before the DT's end, they make a Strength RR.\n≤11: 5 P dam and weakened",
  },
  'Strong Poison': {
    text: "Maneuver: Apply to a weapon or 1 ammo. The next time it deals damage to a creature before the DT's end, they make a Strength RR.\n≤11: 10 P dam and weakened",
  },
  'Sleep Poison': {
    text: "Maneuver: Apply to a weapon or 1 ammo. The next time it deals damage to a creature before the DT's end (or when a creature consumes all of this tasteless, odorless poison), they make an RR or fall asleep.",
  },
  'Truth Poison': {
    text: "Maneuver: A target who consumes all of this tasteless, odorless poison must make a Mind RR. While affected they can't lie and must answer any question asked.",
  },
  'Oil Flask': {
    text: 'Maneuver: Refuel a lantern.\nManeuver: Spread over a 2 x 2 area of ground. A creature entering must make an Agility RR.\n≤11: Prone · 12-16: Lose 2 squares of movement',
    price: '5 gc',
  },
  'Smoke Bomb': {
    text: 'Maneuver: Throw the bomb up to 10 squares. It explodes, creating a 3-cube area of heavy concealment. It becomes light concealment in d6 combat rounds, then dissipates in d6 rounds.',
    price: '60 gc',
  },
  'Fire Bomb': {
    text: 'Action: Throw the bomb up to 10 squares. It explodes in a 3 cube. Each creature in the cube makes an Agility RR.\n≤11: 10 dam · 12-16: 5 dam · 17+: 0 dam',
  },
  'Force Bomb': {
    text: 'Action: Throw the bomb up to 10 squares. It explodes in a 4 cube. You can teleport each ally in the cube 5 squares first. Each creature in the cube makes an Agility RR; unattended objects take 20 dam.\n≤11: 30 dam · 12-16: 15 dam · 17+: 0 dam',
    price: '2,500 gc',
  },
  'Demolition Bomb': {
    text: 'Action: Throw the bomb up to 10 squares. It explodes in a 4 cube. Each creature in the cube makes an Agility RR; unattended objects take 20 dam.\n≤11: 20 dam · 12-16: 10 dam · 17+: 0 dam',
    price: '1,000 gc',
  },
  'Weakening Gas Bomb': {
    text: 'Action: Throw the bomb up to 10 squares. It explodes in a 3 cube. Each creature in the cube makes a Strength RR.\n≤11: Vulnerable and weakened · 12-16: Weakened · 17+: No effect',
    price: '500 gc',
  },
  Torch: { text: 'UD: 1 (Useless; DT)\nManeuver: Light 5/5', price: '2 gc' },
  Chalk: { text: 'UD: 1 (Useless; Activate)\nA piece of chalk in blue, white or yellow. Use it to mark your way or leave messages on stone.', price: '1 gc' },

  // ---- Eşyalar ----
  'Coin Purse': { text: 'Holds up to 500 coins.', price: '1 gc' },
  Rope: { text: '50 feet of rope. If secured, no test is required to climb.', price: '2 gc' },
  '11-Foot Pole': { text: 'An 11-foot-long wooden pole. For poking. Also prodding! Tie some string on it to make a fishing rod!', price: '5 gc' },
  Ladder: {
    text: 'A collapsible ladder.\nManeuver: The ladder expands 10 feet.\nFine (500 gc): expands 20 feet · Masterwork (1,000 gc): expands 30 feet',
    price: '30 gc',
  },
  Tent: { text: 'This waterproof canvas tent sleeps up to 4 humans comfortably. You can use it to wait out bad weather.', price: '100 gc' },
  "Alchemist's Tools": {
    text: 'Required to make crafting rolls for alchemy items.\nFine (500 gc): +1 to alchemy crafting rolls · Masterwork (1,000 gc): +2',
    price: '15 gc',
  },
  "Blacksmith's Tools": {
    text: 'Required to make crafting rolls for blacksmithing items.\nFine (500 gc): +1 to blacksmithing crafting rolls · Masterwork (1,000 gc): +2',
    price: '15 gc',
  },
  "Cook's Utensils": { text: 'Required for some special rest activities in the Travel trait tree. Lots of small knives, forks and the like.' },
  'Surgical Kit': {
    text: 'UD: 1 (Useless; Activate)\nScalpels, threads, needles and bandages made for closing wounds. Use this kit when you take the Tend Wounds rest activity.',
  },
  Lantern: {
    text: 'UD: 2 (Refuel with oil; DT)\nManeuver: Light 10/10\nFine (1,000 gc): 3 UD · Masterwork (2,000 gc): 4 UD',
    price: '25 gc',
  },
  'Bear Trap': {
    text: 'Maneuver: Set this trap on the ground. When a creature steps on it, they take 1d6 dam, and if they are Large or smaller they are grabbed by the trap. It has 10 Stamina.',
    price: '15 gc',
  },
  'Ball Bearings': {
    text: 'A bag of 1,000.\nManeuver: Spread over a 2 x 2 area of ground. Creatures entering must make an Agility RR.\n≤11: Prone and 4 dam · 12-16: Prone · 17+: No effect',
    price: '10 gc',
  },
  Caltrops: { text: 'A bag of 1,000.\nManeuver: Spread over a 2 x 2 area of ground. Creatures entering make an Agility RR.' },
  Bucket: { text: 'Can hold up to 3 gallons of liquid… also good for hiding your face!', price: '2 gc' },
  'Card Deck': { text: 'Standard deck of 54 playing cards, including 2 jokers.' },
  Compass: { text: 'When you make a test related to the guide travel role while carrying a compass, the test gains a +1 bonus.', price: '10 gc' },
  'Glue Pot': {
    text: 'Glue for binding!\nManeuver: Spread over a 2 x 2 area of ground. Creatures entering make a Strength RR.\n≤11: Grabbed by the glue · 12-16: Speed halved',
  },
  'Grappling Hook': { text: 'Can be added to rope to create an item that takes up 2 slots. Makes hurling and securing rope easier.', price: '10 gc' },
  'Holy Symbol': { text: 'An iron symbol of your god.', price: '15 gc' },
  Journal: { text: "A bound journal of 200 blank pages. Don't worry, you'll fill them!", price: '2 gc' },
  'Lockpick Set': {
    text: 'Tools specifically made for picking locks.\nFine (750 gc): +1 on tests to pick locks · Masterwork (1,500 gc): +2',
    price: '25 gc',
  },
  'Lore Book': {
    text: 'This book relates to one lore expertise. Study it as a rest activity and you gain that expertise and 1 additional Effort that you can use only with that expertise.',
  },
  "Merchant's Scales": { text: 'Used to determine the weight of Tiny objects and Tiny creatures that sit still.', price: '50 gc' },
  "Miner's Pick": { text: 'Great for breaking stones and the occasional skull.', price: '10 gc' },
  Mirror: { text: 'A hand mirror, useful for looking around corners and at your own mug.', price: '100 gc' },
  'Monster Trap': {
    text: 'Action: Hurl this iron sphere at a creature within 5 squares of you, who must make a Mind RR. If affected, they are trapped in the sphere.',
  },
  Net: {
    text: 'This fishing net unfurls when hurled. You can hurl it at a Medium or smaller creature as part of the Grab maneuver, which gives you an edge on the test.',
  },
  Padlock: {
    text: 'Iron padlock. Includes a key.\nFine (750 gc): Tests to pick or break the lock take a -1 penalty · Masterwork (1,500 gc): -2 penalty',
  },
  Pitons: { text: 'Iron spikes that can be hammered into stone and used to secure ropes. Come in multiples of 10.', price: '5 gc' },
  Pot: { text: 'Iron pot for cooking. Makes great scrambled eggs and soup! Comes with a heavy lid.', price: '5 gc' },
  'Quill and Inkpot': { text: 'For writing stuff down!', price: '5 gc' },
  Shovel: { text: 'Use this to dig holes! Can also make a decent crowbar in a pinch, but might break.', price: '10 gc' },
  Soap: {
    text: 'UD: 1 (Useless; Activate)\nClean yourself or a mess, leave messages, whittle shapes, or lubricate locks, tools, or your wrists when bound in chains.',
    price: '1 gc',
  },
  Spyglass: {
    text: 'Makes things appear 3 times closer.\nFine (500 gc): 6 times closer · Masterwork (1,000 gc): 10 times closer',
  },
  String: { text: '1,000 feet of string.', price: '1 gc' },
  Whistle: { text: 'Maneuver: Create a loud noise that can be heard from 20 squares away.', price: '5 gc' },
  'Magnifying Glass': { text: 'Better inspect the minute visual details of nearby creatures and objects.', price: '100 gc' },
  'Musical Instrument': {
    text: 'A portable musical instrument, like a lute, lyre, mandolin, drum or fife. To play it, the instrument must occupy both your hand slots.',
    price: '100 gc',
  },

  // ---- Büyülü ----
  'Alteration Stone': {
    text: "Choose one benefit when you make the stone. The creature carrying it gains it:\n• You don't need to eat or drink to live.\n• You don't need to breathe to live.\n• The stone sheds light 5/5.",
  },
  'Plague Mask': { text: 'Wearable. While you wear the mask, you have a +2 bonus on Mind RRs made to resist the effects of the Miasma.', price: '500 gc' },
  'Death Ring': {
    text: 'Wearable · UD 1 (Rest; Activate)\nAction: Choose an undead within 10 squares of you to make a Mind RR. On a failure, the undead teleports next to you and you can command it.',
  },
  'Feather Poulaines': {
    text: 'Wearable. While you wear these shoes your speed is increased by 1. When you are force moved, the distance is increased by 1 and you take a -1 penalty on tests to escape being grabbed.',
    price: '1,000 gc',
  },
  'Boom Wand': {
    text: 'UD 1 (Useless; Activate)\nAction: Create a 5 cube of fire within 15 squares of you. Each creature in the area must make an Agility RR.',
  },
  'Hurling Wand': {
    text: 'UD 1 (Useless; Activate)\nManeuver: Target a creature within 15 squares of you. They make a Strength RR.\n≤11: 10 vertical slide · 12-16: 5 vertical slide',
  },
  'Spider Box': {
    text: 'UD 1 (Rest; see below)\nAction: Hurl this box up to 5 squares; stone spiders crawl from it onto the creature closest to the box.',
  },
  'Chicken Bag': {
    text: "UD: 2 (Rest; Activate)\nManeuver: Reach into the bag and roll 1d10. On a 1-9 you pull out a chicken. On a 10 you pull out a giant crow who is hostile to all creatures who aren't giant crows.",
    price: '5,000 gc',
  },

  // ---- Hazine ----
  Gem: { text: 'A shiny rock. Exact gem type and value are determined by the Ref.' },
  'Creature Part': { text: 'A piece of a creature used in crafting.' },
  'Iron Bar': { text: 'A metal bar used in crafting. The Ref determines the nature of the crafting material.' },
}

/** Büyü kitapları için genel açıklama (kartlarda her büyünün kendi istatistikleri vardır). */
export const SPELLBOOK_INFO: ItemCardInfo = {
  text: 'Spellbook · UD 1 (Rest; Activate)\nWield it in a hand slot to cast its spell. Its usage die recharges when you finish a rest. See the card for range, targets and casting results.',
}

export function itemInfo(name: string, category?: string): ItemCardInfo | undefined {
  return ITEM_CARDS[name] ?? (category === 'spellbook' || name.startsWith('Spellbook:') ? SPELLBOOK_INFO : undefined)
}
