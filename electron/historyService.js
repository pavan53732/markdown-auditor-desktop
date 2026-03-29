const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Manages local audit history using a file-backed index and individual session files.
 */
class HistoryService {
  constructor(basePath) {
    this.basePath = basePath;
    this.indexPath = path.join(basePath, 'index.json');
    this.sessionsDir = path.join(basePath, 'sessions');
  }

  ensureDirs() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * Lists all history entries from the index.
   */
  list() {
    try {
      if (!fs.existsSync(this.indexPath)) {
        return [];
      }
      const data = fs.readFileSync(this.indexPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`[HistoryService] Failed to read history index:`, err.message);
      return [];
    }
  }

  /**
   * Reads a full session file by ID.
   */
  readSession(id) {
    try {
      const sessionPath = path.join(this.sessionsDir, `${id}.json`);
      if (!fs.existsSync(sessionPath)) {
        throw new Error(`Session ${id} not found`);
      }
      const data = fs.readFileSync(sessionPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`[HistoryService] Failed to read session ${id}:`, err.message);
      return null;
    }
  }

  /**
   * Adds a new session to history.
   * metadata: { timestamp, title, fileCount, issuesCount: { critical, high, medium, low, total }, model, profile }
   * session: full results object
   */
  add(metadata, session) {
    try {
      this.ensureDirs();
      const id = uuidv4();
      const entry = { ...metadata, id };

      // 1. Write session file atomically
      const sessionPath = path.join(this.sessionsDir, `${id}.json`);
      const tempSessionPath = `${sessionPath}.tmp`;
      fs.writeFileSync(tempSessionPath, JSON.stringify(session), 'utf-8');
      fs.renameSync(tempSessionPath, sessionPath);

      // 2. Update index
      const index = this.list();
      index.unshift(entry); // Newest first
      
      const tempIndexPath = `${this.indexPath}.tmp`;
      fs.writeFileSync(tempIndexPath, JSON.stringify(index, null, 2), 'utf-8');
      fs.renameSync(tempIndexPath, this.indexPath);

      return { success: true, id };
    } catch (err) {
      console.error(`[HistoryService] Failed to add history entry:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Deletes a history entry and its session file.
   */
  delete(id) {
    try {
      // 1. Delete session file
      const sessionPath = path.join(this.sessionsDir, `${id}.json`);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }

      // 2. Update index
      let index = this.list();
      index = index.filter(entry => entry.id !== id);
      
      const tempIndexPath = `${this.indexPath}.tmp`;
      fs.writeFileSync(tempIndexPath, JSON.stringify(index, null, 2), 'utf-8');
      fs.renameSync(tempIndexPath, this.indexPath);

      return { success: true };
    } catch (err) {
      console.error(`[HistoryService] Failed to delete history entry ${id}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Updates an existing history entry's metadata in the index.
   */
  update(id, updates) {
    try {
      let index = this.list();
      const entryIdx = index.findIndex(e => e.id === id);
      
      if (entryIdx === -1) {
        throw new Error(`Entry ${id} not found in index`);
      }

      index[entryIdx] = { ...index[entryIdx], ...updates };
      
      const tempIndexPath = `${this.indexPath}.tmp`;
      fs.writeFileSync(tempIndexPath, JSON.stringify(index, null, 2), 'utf-8');
      fs.renameSync(tempIndexPath, this.indexPath);

      return { success: true };
    } catch (err) {
      console.error(`[HistoryService] Failed to update history entry ${id}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Prunes history to keep only the most recent N entries.
   */
  prune(maxEntries) {
    try {
      let index = this.list();
      if (index.length <= maxEntries) return { success: true, pruned: 0 };

      const toKeep = index.slice(0, maxEntries);
      const toDelete = index.slice(maxEntries);

      // 1. Delete session files for entries being pruned
      for (const entry of toDelete) {
        const sessionPath = path.join(this.sessionsDir, `${entry.id}.json`);
        if (fs.existsSync(sessionPath)) {
          fs.unlinkSync(sessionPath);
        }
      }

      // 2. Update index
      const tempIndexPath = `${this.indexPath}.tmp`;
      fs.writeFileSync(tempIndexPath, JSON.stringify(toKeep, null, 2), 'utf-8');
      fs.renameSync(tempIndexPath, this.indexPath);

      return { success: true, pruned: toDelete.length };
    } catch (err) {
      console.error(`[HistoryService] Failed to prune history:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Clears all history.
   */
  clear() {
    try {
      if (fs.existsSync(this.sessionsDir)) {
        const files = fs.readdirSync(this.sessionsDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.sessionsDir, file));
        }
      }
      if (fs.existsSync(this.indexPath)) {
        fs.unlinkSync(this.indexPath);
      }
      return { success: true };
    } catch (err) {
      console.error(`[HistoryService] Failed to clear history:`, err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = HistoryService;
