export class AssetCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100 * 1024 * 1024; // 100MB
    this.currentSize = 0;
  }

  async cacheAsset(key, asset, type) {
    const size = this.getAssetSize(asset);
    
    // Check if we need to clear space
    while (this.currentSize + size > this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data: asset,
      type,
      size,
      timestamp: Date.now()
    });
    
    this.currentSize += size;

    // Store in IndexedDB for persistence
    await this.persistToIndexedDB(key, asset, type);
  }

  async getAsset(key) {
    // Try memory cache first
    const cached = this.cache.get(key);
    if (cached) {
      cached.timestamp = Date.now(); // Update last access
      return cached.data;
    }

    // Try IndexedDB
    return this.getFromIndexedDB(key);
  }

  getAssetSize(asset) {
    if (typeof asset === 'string') {
      return new Blob([asset]).size;
    }
    return asset.size || 0;
  }

  evictOldest() {
    let oldest = null;
    let oldestKey = null;

    for (const [key, value] of this.cache.entries()) {
      if (!oldest || value.timestamp < oldest.timestamp) {
        oldest = value;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.currentSize -= oldest.size;
      this.cache.delete(oldestKey);
    }
  }
}