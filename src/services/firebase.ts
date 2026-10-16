import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { firebaseConfig } from '../firebase.config'

export const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  // Eşyalardaki opsiyonel alanlar (ad, worn…) undefined olabilir; Firestore bunları yok sayar.
  ignoreUndefinedProperties: true,
  // Çevrimdışı önbellek: sayfa anında açılır, bağlantı kopunca yazımlar kuyrukta bekler.
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

const DEVICE_KEY = 'crows-tracker:device-id'

/**
 * Bu tarayıcının kalıcı kimliği. Hesap gerekmez; oyunu kuran cihazı tanımak
 * (oyunu düzenleme/silme düğmelerini göstermek) için kullanılır.
 */
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}
