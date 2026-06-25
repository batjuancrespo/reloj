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
    // Leer todos los archivos ANTES de abrir la transacción
    const entries = [];
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        entries.push({
            data: await readFileAsArrayBuffer(file),
            type: file.type
        });
    }
    if (entries.length === 0) throw new Error('No hay imágenes válidas');
    // Ahora abrir transacción y guardar (sin await entre operaciones IDB)
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const entry of entries) {
        store.add(entry);
    }
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}

function getAllFromStore(store) {
    return new Promise(function(resolve, reject) {
        var result = [];
        var req = store.openCursor();
        req.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                result.push(cursor.value);
                cursor.continue();
            } else {
                resolve(result);
            }
        };
        req.onerror = function() { reject(req.error); };
    });
}

export async function loadPhotos() {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const all = await getAllFromStore(store);
    db.close();
    return all.map(function(entry) {
        var blob = new Blob([entry.data], { type: entry.type });
        return URL.createObjectURL(blob);
    });
}

export async function clearPhotos() {
    if (!window.indexedDB) return;
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
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
