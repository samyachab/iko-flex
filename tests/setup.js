// localStorage en mémoire (le moteur y lit réglages, rotation et carnet de douleur), vidé avant chaque test
import { beforeEach, vi } from 'vitest'

const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
}

beforeEach(() => {
  store.clear()
  vi.useRealTimers()
})
