import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  collection, deleteDoc, doc, getDocs, limit, onSnapshot, query, setDoc, where, writeBatch, type Unsubscribe,
} from 'firebase/firestore'
import type { Character, Game, StoreState } from '../interfaces'
import { db, deviceId } from './firebase'

// Veriler Firebase Firestore'da tutulur ve tüm cihazlarda canlı senkronlanır:
//   games/{gameId}                      → oyun
//   games/{gameId}/characters/{charId}  → o oyunun karakterleri
// Bu cihazın bildiği oyunların listesi (oluşturduğu veya kodla katıldığı) localStorage'da durur.

const MY_GAMES_KEY = 'crows-tracker:my-games'

export type SyncStatus = 'connecting' | 'live' | 'error'
type State = StoreState & { status: SyncStatus; uid: string | null; loadedGames: string[] }

let state: State = { games: [], characters: [], status: 'connecting', uid: null, loadedGames: [] }
const listeners = new Set<() => void>()
const subscriptions = new Map<string, Unsubscribe[]>()

function emit(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Tüm durumu döndürür; seçimi bileşen içinde useMemo ile yapın (referans kararlılığı için). */
export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

export const uid = () => crypto.randomUUID()

// ---- Bu cihazın oyun listesi ----
function myGameIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_GAMES_KEY) ?? '[]')
  } catch {
    return []
  }
}
function saveMyGameIds(ids: string[]) {
  try {
    localStorage.setItem(MY_GAMES_KEY, JSON.stringify(ids))
  } catch {
    // Depolama engelliyse liste yalnızca bu oturumda kalır.
  }
}

/** Oyunu ve karakterlerini canlı dinlemeye başlar. */
function watchGame(gameId: string) {
  if (subscriptions.has(gameId)) return
  if (!myGameIds().includes(gameId)) saveMyGameIds([...myGameIds(), gameId])
  const onError = (err: Error) => {
    console.error(err)
    emit({ status: 'error' })
  }
  const unsubGame = onSnapshot(
    doc(db, 'games', gameId),
    (snap) => {
      if (!snap.exists()) {
        // Oyun silinmiş: bu cihazdan da kaldır.
        forgetGame(gameId)
        return
      }
      const game = snap.data() as Game
      emit({ status: 'live', games: [...state.games.filter((g) => g.id !== gameId), game].sort((a, b) => a.createdAt - b.createdAt) })
    },
    onError,
  )
  const unsubChars = onSnapshot(
    collection(db, 'games', gameId, 'characters'),
    (snap) => {
      const chars = snap.docs.map((d) => d.data() as Character).sort((a, b) => a.createdAt - b.createdAt)
      emit({
        characters: [...state.characters.filter((c) => c.gameId !== gameId), ...chars],
        loadedGames: state.loadedGames.includes(gameId) ? state.loadedGames : [...state.loadedGames, gameId],
      })
    },
    onError,
  )
  subscriptions.set(gameId, [unsubGame, unsubChars])
}

/** Oyunu yalnızca bu cihazın listesinden kaldırır (veritabanından silmez). */
export function forgetGame(gameId: string) {
  subscriptions.get(gameId)?.forEach((u) => u())
  subscriptions.delete(gameId)
  saveMyGameIds(myGameIds().filter((id) => id !== gameId))
  emit({ games: state.games.filter((g) => g.id !== gameId), characters: state.characters.filter((c) => c.gameId !== gameId) })
}

// Uygulama açılınca bu cihazın bildiği oyunları dinlemeye başla.
emit({ uid: deviceId(), status: myGameIds().length ? 'connecting' : 'live' })
myGameIds().forEach(watchGame)

// ---- Oyun CRUD ----
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const randomCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

async function queryByCode(code: string): Promise<Game | null> {
  const snap = await getDocs(query(collection(db, 'games'), where('code', '==', code), limit(1)))
  return snap.empty ? null : (snap.docs[0].data() as Game)
}

export async function createGame(data: Pick<Game, 'name' | 'refName' | 'village'>): Promise<Game> {
  let code = randomCode()
  while (await queryByCode(code)) code = randomCode()
  const game: Game = { ...data, id: uid(), code, ownerUid: deviceId(), createdAt: Date.now() }
  emit({ games: [...state.games, game] })
  await setDoc(doc(db, 'games', game.id), game)
  watchGame(game.id)
  return game
}

export async function updateGame(id: string, patch: Partial<Game>) {
  const game = state.games.find((g) => g.id === id)
  if (!game) return
  const next = { ...game, ...patch }
  emit({ games: state.games.map((g) => (g.id === id ? next : g)) })
  await setDoc(doc(db, 'games', id), next)
}

/** Oyunu ve tüm karakterlerini herkes için siler (yalnızca oyunu kuran cihaz). */
export async function deleteGame(id: string) {
  const snap = await getDocs(collection(db, 'games', id, 'characters'))
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  await deleteDoc(doc(db, 'games', id))
  forgetGame(id)
}

/** Kodla oyunu bulur ve bu cihazın listesine ekler. */
export async function findGameByCode(code: string): Promise<Game | null> {
  const normalized = code.trim().toUpperCase()
  const known = state.games.find((g) => g.code === normalized)
  if (known) return known
  const game = await queryByCode(normalized)
  if (game) {
    emit({ games: [...state.games.filter((g) => g.id !== game.id), game] })
    watchGame(game.id)
  }
  return game
}

/** URL'deki koda göre oyunu getirir; bu cihaz bilmiyorsa veritabanında arar. */
export function useGame(code: string | undefined) {
  const { games } = useStore()
  const game = games.find((g) => g.code === code?.toUpperCase())
  const [lookup, setLookup] = useState<{ code?: string; done: boolean }>({ done: false })
  useEffect(() => {
    if (game || !code || lookup.code === code) return
    findGameByCode(code)
      .catch(() => null)
      .finally(() => setLookup({ code, done: true }))
  }, [code, game, lookup.code])
  return { game, loading: !game && !(lookup.code === code && lookup.done) }
}

// ---- Karakter CRUD ----
const charRef = (c: Pick<Character, 'gameId' | 'id'>) => doc(db, 'games', c.gameId, 'characters', c.id)

export async function createCharacter(character: Character) {
  emit({ characters: [...state.characters, character] })
  await setDoc(charRef(character), character)
}

export function updateCharacter(id: string, update: (c: Character) => Character) {
  const current = state.characters.find((c) => c.id === id)
  if (!current) return
  const next = { ...update(current), updatedAt: Date.now() }
  // İyimser güncelleme: ekran anında değişir, yazım arka planda Firestore'a gider.
  emit({ characters: state.characters.map((c) => (c.id === id ? next : c)) })
  setDoc(charRef(next), next).catch((err) => {
    console.error(err)
    emit({ status: 'error' })
  })
}

export async function deleteCharacter(id: string) {
  const c = state.characters.find((x) => x.id === id)
  if (!c) return
  emit({ characters: state.characters.filter((x) => x.id !== id) })
  await deleteDoc(charRef(c))
}

// ---- İçe / dışa aktarma (yedek almak için) ----
export function exportGame(gameId: string): string {
  const game = state.games.find((g) => g.id === gameId)
  const characters = state.characters.filter((c) => c.gameId === gameId)
  return JSON.stringify({ game, characters }, null, 2)
}

/** Yedek dosyasını yeni bir oyun olarak (yeni kodla) yükler. */
export async function importGame(json: string): Promise<Game> {
  const data = JSON.parse(json) as { game: Game; characters: Character[] }
  if (!data.game?.id || !Array.isArray(data.characters)) throw new Error('Geçersiz oyun dosyası')
  const game = await createGame({ name: data.game.name, refName: data.game.refName ?? '', village: data.game.village ?? '' })
  const batch = writeBatch(db)
  data.characters.forEach((c) => {
    const copy = { ...c, id: uid(), gameId: game.id }
    batch.set(charRef(copy), copy)
  })
  await batch.commit()
  return game
}
