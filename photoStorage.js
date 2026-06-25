const DB_NAME = 'RelojPhotoDB';
const DB_VERSION = 2;
const STORE_NAME = 'photos';

let photoKeys = [];

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
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
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore;
    photoKeys = await new Promise((resolve, reject) => {
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
}

export async function appendPhotos(files) {
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
}

export async function clearPhotos() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore;
    store.clear();
    await completeTx(tx);
    db.close();
    photoKeys = [];
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

    return loadPhotoByKey(key);
}

export async function loadPhotoByKey(key) {
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
}

export async function hasStoredPhotos() {
    if (photoKeys.length > 0) return true;
    await refreshPhotoKeys();
    return photoKeys.length > 0;
}

export function getPhotoCount() {
    return photoKeys.length;
}
