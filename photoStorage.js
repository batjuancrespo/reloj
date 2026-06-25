const DB_NAME = 'RelojPhotoDB';
const DB_VERSION = 3;
const STORE_NAME = 'photos';

let photoKeys = [];
let dbAvailable = true;
let memoryStore = new Map();
let memoryIdCounter = 0;
let useMemory = false;

function openDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB no disponible'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('IndexedDB bloqueado'));
    });
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function completeTx(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function refreshPhotoKeys() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore;
        photoKeys = await new Promise((resolve, reject) => {
            const req = store.getAllKeys();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        db.close();
        useMemory = false;
    } catch (e) {
        dbAvailable = false;
    }
}

export async function appendPhotos(files) {
    if (!useMemory) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore;

            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;
                const data = await readFileAsArrayBuffer(file);
                store.add({ data, type: file.type });
            }

            await completeTx(tx);
            db.close();
            await refreshPhotoKeys();
            return;
        } catch (e) {
            useMemory = true;
        }
    }

    // Fallback: guardar en memoria
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const data = await readFileAsArrayBuffer(file);
        memoryIdCounter++;
        memoryStore.set(memoryIdCounter, { data, type: file.type });
        photoKeys.push(memoryIdCounter);
    }
}

export async function clearPhotos() {
    if (!useMemory) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore;
            store.clear();
            await completeTx(tx);
            db.close();
        } catch (e) {
            useMemory = true;
        }
    }
    memoryStore.clear();
    photoKeys = [];
    memoryIdCounter = 0;
}

export async function loadRandomPhoto(excludeKey) {
    if (photoKeys.length === 0) return null;

    let key;
    if (photoKeys.length > 1 && excludeKey !== undefined) {
        const candidates = photoKeys.filter(k => k !== excludeKey);
        key = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
        key = photoKeys[Math.floor(Math.random() * photoKeys.length)];
    }

    if (useMemory) {
        const entry = memoryStore.get(key);
        if (!entry) return null;
        const blob = new Blob([entry.data], { type: entry.type });
        return { url: URL.createObjectURL(blob), key };
    }

    return loadPhotoByKey(key);
}

export async function loadPhotoByKey(key) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore;
        const entry = await new Promise((resolve, reject) => {
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        db.close();

        if (!entry) return null;
        const blob = new Blob([entry.data], { type: entry.type });
        return { url: URL.createObjectURL(blob), key };
    } catch (e) {
        return null;
    }
}

export async function hasStoredPhotos() {
    if (photoKeys.length > 0) return true;
    if (!dbAvailable) return false;
    await refreshPhotoKeys();
    return photoKeys.length > 0;
}

export function getPhotoCount() {
    return photoKeys.length;
}
