const DB_NAME = 'FlowPaceDB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('routines')) db.createObjectStore('routines', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('completions')) db.createObjectStore('completions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
  });
}

const db = {
  async getAll(store) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, 'readonly');
      const os = tx.objectStore(store);
      const req = os.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async get(store, key) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, 'readonly');
      const os = tx.objectStore(store);
      const req = os.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async put(store, data) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const req = os.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async delete(store, key) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const req = os.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  async clear(store) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const req = os.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  // helpers
  async getRoutines() {
    return (await this.getAll('routines')) || [];
  },
  async saveRoutine(routine) {
    await this.put('routines', routine);
  },
  async deleteRoutine(id) {
    await this.delete('routines', id);
  },
  async getSettings() {
    const s = await this.get('settings', 'app');
    return s || { key: 'app', is_pro: false, is_audio_enabled: true, is_voice_enabled: false, volume: 0.7, selected_sound_pack: 'default', background_color: 'blue' };
  },
  async saveSettings(settings) {
    await this.put('settings', { key: 'app', ...settings });
  },
  async getCompletions() {
    return (await this.getAll('completions')) || [];
  },
  async saveCompletion(c) {
    await this.put('completions', c);
  },
  async getMeta(key) {
    return await this.get('meta', key);
  },
  async setMeta(key, value) {
    await this.put('meta', { key, value, updated_at: new Date().toISOString() });
  },
};

if (typeof module !== 'undefined') module.exports = { db };
