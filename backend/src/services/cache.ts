type CacheEntry<T> = {
  data: T;
  expiredAt: number;
};

export class InMemoryCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly ttlMs: number;

  constructor(ttlMs = 300_000) {
    this.ttlMs = ttlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiredAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      expiredAt: Date.now() + this.ttlMs,
    });
  }
}
