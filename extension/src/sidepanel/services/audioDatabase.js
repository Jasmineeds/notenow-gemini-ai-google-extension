export class AudioDatabase {
  static DATABASE_NAME = 'audioDatabase';
  static STORE_NAME = 'audioStore';
  static VERSION = 1;

  static async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DATABASE_NAME, this.VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async saveAudioBlob(blob) {
    const db = await this.initDatabase();
    const transaction = db.transaction(this.STORE_NAME, "readwrite");
    const store = transaction.objectStore(this.STORE_NAME);
    return store.put(blob, Date.now().toString());
  }
}