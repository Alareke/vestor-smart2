// Simple Watchlists manager using IndexedDB for more robust storage.
const DB_NAME = 'vestor_db';
const DB_VERSION = 1;
const STORE_NAME = 'watchlists';

let dbPromise = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'name' });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.errorCode);
                reject(event.target.error);
            };
        });
    }
    return dbPromise;
}

export async function listNames() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();
        request.onsuccess = () => {
            // Sort to have a consistent order, perhaps alphabetically
            resolve(request.result.sort());
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function getList(name) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(name);
        request.onsuccess = () => {
            resolve(request.result ? request.result.symbols : []);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function setList(name, arr) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ name, symbols: arr || [] });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function ensureDefault() {
    const names = await listNames();
    if (names.length === 0) {
        const seed = ['الأسهم المفضلة', 'فوركس', 'كريبتو'];
        for (const name of seed) {
            await addList(name);
        }
    }
}

export async function addList(name) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        // Add only if it doesn't exist
        const request = store.add({ name, symbols: [] });
        request.onsuccess = async () => {
            const allNames = await listNames();
            resolve(allNames);
        };
        request.onerror = async (event) => {
             if (event.target.error.name === 'ConstraintError') {
                // Already exists, resolve with current names
                const allNames = await listNames();
                resolve(allNames);
            } else {
                reject(event.target.error);
            }
        };
    });
}

export async function removeList(name) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(name);
        request.onsuccess = async () => {
            const allNames = await listNames();
            resolve(allNames);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function renameList(oldName, newName) {
    if (oldName === newName) return listNames();
    const data = await getList(oldName);
    await setList(newName, data);
    await removeList(oldName);
    return listNames();
}

export async function addSymbol(name, item) {
    const arr = await getList(name);
    if (!arr.find(x => x.symbol === item.symbol)) {
        arr.unshift(item);
    }
    await setList(name, arr);
    return arr;
}

export async function removeSymbol(name, symbol) {
    let arr = await getList(name);
    arr = arr.filter(x => x.symbol !== symbol);
    await setList(name, arr);
    return arr;
}

export async function exportAll() {
    const names = await listNames();
    const lists = {};
    for (const name of names) {
        lists[name] = await getList(name);
    }
    return { names, lists };
}

export async function importAll(payload) {
    if (!payload || !payload.names || !payload.lists) return;
    for (const name of payload.names) {
        await setList(name, payload.lists[name] || []);
    }
}