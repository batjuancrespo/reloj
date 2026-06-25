const DB_NAME = 'RelojPhotoDB';
const DB_VERSION = 4;
const STORE_NAME = 'photos';

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

export async function savePhotos(files) {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore;
    store.clear();
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const data = await readFileAsArrayBuffer(file);
        store.add({ data, type: file.type });
    }
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}

export async function loadPhotos() {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore;
    const all = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return all.map(entry => {
        const blob = new Blob([entry.data], { type: entry.type });
        return URL.createObjectURL(blob);
    });
}

export async function clearPhotos() {
    if (!window.indexedDB) return;
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore;
        store.clear();
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        db.close();
    } catch (e) {
        console.error('Error limpiando fotos:', e);
    }
}
