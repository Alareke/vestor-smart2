export const IdbCache = {
  async get(key: string) {
    try {
      const raw = localStorage.getItem('idb:' + key);
      if (raw && raw !== 'null' && raw !== 'undefined') {
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  },
  async set(key:string, val:any){ localStorage.setItem('idb:'+key, JSON.stringify(val)) }
}