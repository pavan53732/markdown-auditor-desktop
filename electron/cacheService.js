const fs = require('fs');
const path = require('path');

/**
 * Reusable logic for managing the file-backed analysis cache.
 * Uses atomic writes to prevent corruption.
 */
class CacheService {
  constructor(cachePath) {
    this.cachePath = cachePath;
    this.dir = path.dirname(cachePath);
  }

  /**
   * Reads the cache file. Returns empty object if missing or corrupt.
   */
  read() {
    try {
      if (!fs.existsSync(this.cachePath)) {
        return {};
      }
      const data = fs.readFileSync(this.cachePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`[CacheService] Failed to read or parse cache at ${this.cachePath}:`, err.message);
      // If corrupt, we return empty to avoid crashing the app.
      // In a more advanced version, we might back up the corrupt file.
      return {};
    }
  }

  /**
   * Writes data to the cache file atomically using a temp file.
   */
  write(data) {
    try {
      if (!fs.existsSync(this.dir)) {
        fs.mkdirSync(this.dir, { recursive: true });
      }

      const tempPath = `${this.cachePath}.tmp`;
      const content = JSON.stringify(data);
      
      fs.writeFileSync(tempPath, content, 'utf-8');
      fs.renameSync(tempPath, this.cachePath);
      
      return { success: true };
    } catch (err) {
      console.error(`[CacheService] Failed to write cache at ${this.cachePath}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Deletes the cache file.
   */
  clear() {
    try {
      if (fs.existsSync(this.cachePath)) {
        fs.unlinkSync(this.cachePath);
      }
      return { success: true };
    } catch (err) {
      console.error(`[CacheService] Failed to clear cache at ${this.cachePath}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Returns basic metrics about the cache.
   */
  getStats() {
    const data = this.read();
    return {
      exists: fs.existsSync(this.cachePath),
      entryCount: Object.keys(data).length,
      path: this.cachePath
    };
  }
}

module.exports = CacheService;
