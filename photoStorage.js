var DB_NAME = 'RelojPhotoDB';
var DB_VERSION = 5;
var STORE_NAME = 'photos';

function openDB() {
    return new Promise(function(resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB no disponible'));
            return;
        }
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = function() { resolve(request.result); };
        request.onerror = function() { reject(request.error); };
    });
}

function readFileAsArrayBuffer(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function() { reject(reader.error); };
        reader.readAsArrayBuffer(file);
    });
}

export async function savePhotos(files) {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    var entries = [];
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!file.type.startsWith('image/')) continue;
        entries.push({
            data: await readFileAsArrayBuffer(file),
            type: file.type
        });
    }
    if (entries.length === 0) throw new Error('No hay imágenes válidas');

    var db = await openDB();
    var tx = db.transaction(STORE_NAME, 'readwrite');
    var store = tx.objectStore(STORE_NAME);
    store.clear();
    for (var j = 0; j < entries.length; j++) {
        store.add(entries[j]);
    }
    await new Promise(function(resolve, reject) {
        tx.oncomplete = resolve;
        tx.onerror = function() { reject(tx.error); };
    });
    db.close();
}

export async function getPhotoKeys() {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    var db = await openDB();
    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var keys = await new Promise(function(resolve, reject) {
        var result = [];
        var req = store.openCursor();
        req.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                result.push(cursor.key);
                cursor.continue();
            } else {
                resolve(result);
            }
        };
        req.onerror = function() { reject(req.error); };
    });
    db.close();
    return keys;
}

export async function loadPhotoByKey(key) {
    if (!window.indexedDB) throw new Error('IndexedDB no disponible');
    var db = await openDB();
    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var entry = await new Promise(function(resolve, reject) {
        var req = store.get(key);
        req.onsuccess = function() { resolve(req.result); };
        req.onerror = function() { reject(req.error); };
    });
    db.close();
    if (!entry) return null;
    var blob = new Blob([entry.data], { type: entry.type });
    return URL.createObjectURL(blob);
}

export async function clearPhotos() {
    if (!window.indexedDB) return;
    try {
        var db = await openDB();
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        store.clear();
        await new Promise(function(resolve, reject) {
            tx.oncomplete = resolve;
            tx.onerror = function() { reject(tx.error); };
        });
        db.close();
    } catch (e) {
        console.error('Error limpiando fotos:', e);
    }
}
