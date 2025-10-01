const STORAGE_KEY = "axohub_ipfs_store_v1"

// In-memory fallback if localStorage isn't available (SSR-safe access guarded)
const memoryStore: Record<string, { type: "text" | "json" | "binary"; content: string }> = {}

function randomCid() {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readStore() {
  if (typeof window === "undefined") return { ...memoryStore }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, { type: "text" | "json" | "binary"; content: string }>
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, { type: "text" | "json" | "binary"; content: string }>) {
  if (typeof window === "undefined") {
    Object.assign(memoryStore, store)
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // non-fatal in demo
  }
}

export const ipfsMock = {
  async putText(text: string) {
    const cid = randomCid()
    const store = readStore()
    store[cid] = { type: "text", content: text }
    writeStore(store)
    return cid
  },
  async putObject(obj: unknown) {
    const pretty = JSON.stringify(obj, null, 2)
    const cid = randomCid()
    const store = readStore()
    store[cid] = { type: "json", content: pretty }
    writeStore(store)
    return cid
  },
  async putFile(file: File) {
    const text = await file.text()
    // Attempt to detect JSON
    try {
      const parsed = JSON.parse(text)
      return await this.putObject(parsed)
    } catch {
      return await this.putText(text)
    }
  },
  async get(cid: string) {
    const store = readStore()
    const entry = store[cid]
    if (!entry) return null
    return entry // { type, content }
  },
  async getText(cid: string) {
    const entry = await this.get(cid)
    if (!entry) return null
    return entry.content
  },
  async has(cid: string) {
    const store = readStore()
    return Boolean(store[cid])
  },
}
