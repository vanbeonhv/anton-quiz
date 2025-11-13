import { LRUCache } from 'lru-cache'

const options = {
  max: 500,
  // for use with tracking overall storage size
  maxSize: 5000,
  // Calculate size of each entry (rough estimate based on JSON string length)
  sizeCalculation: (value: unknown) => {
    return JSON.stringify(value).length
  },
  // how long to live in ms
  ttl: 1000 * 60 * 60, // 1 hour
  // return stale items before removing from cache?
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,

  // async method to use for cache misses
  fetchMethod: async (
    _key: string,
    _staleValue: unknown,
    { signal }: { options: unknown; signal: AbortSignal; context: unknown }
  ) => {
    if (signal.aborted) {
      return
    }
  },
}

export const cache = new LRUCache(options)

// Helper function to generate a cache key from a request
export const getCacheKey = (req: Request) => {
  const url = new URL(req.url)
  return `${url.pathname}${url.search}`
}
