import { savePhotos, getPhotoKeys, loadPhotoByKey, clearPhotos } from './photoStorage.js';

var slideshowIntervalId = null;
var slideshowImageElement = null;
var photoKeys = [];
var currentPhotoUrl = null;
var currentKey = -1;

function revokeCurrentUrl() {
    if (currentPhotoUrl) {
        URL.revokeObjectURL(currentPhotoUrl);
        currentPhotoUrl = null;
    }
}

async function handleFileSelection(event) {
    var files = event.target.files;
    if (!files || files.length === 0) return;

    try {
        await savePhotos(Array.from(files));
        photoKeys = await getPhotoKeys();
        alert('Se han cargado y guardado ' + photoKeys.length + ' imágenes.');
    } catch (e) {
        alert('Error al guardar: ' + e.message);
        return;
    }

    event.target.value = '';

    if (slideshowIntervalId) {
        stopSlideshow();
        startSlideshow();
    }
}

async function loadPhotosFromStorage() {
    try {
        photoKeys = await getPhotoKeys();
        if (photoKeys.length === 0) return false;
        return true;
    } catch (e) {
        console.error('Error cargando fotos:', e);
        return false;
    }
}

function updateLabelToIcon() {
    var label = document.getElementById('photoSelectLabel');
    if (!label) return;
    label.className = 'icon-button';
    label.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    label.title = 'Añadir fotos';
}

function addClearButton() {
    var container = document.querySelector('.slideshow-controls-container');
    if (!container) return;

    var clearBtn = document.createElement('button');
    clearBtn.id = 'clearPhotosBtn';
    clearBtn.className = 'icon-button';
    clearBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    clearBtn.title = 'Vaciar galería';
    clearBtn.addEventListener('click', async function() {
        if (photoKeys.length === 0) return;
        if (confirm('¿Borrar todas las fotos de la galería?')) {
            await clearAllPhotos();
        }
    });

    var toggleContainer = container.querySelector('.toggle-switch-container');
    if (toggleContainer) {
        container.insertBefore(clearBtn, toggleContainer);
    } else {
        container.appendChild(clearBtn);
    }
}

export async function initSlideshow(imageElementId, inputElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) return;

    var photoInput = document.getElementById(inputElementId);
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelection);
    }

    updateLabelToIcon();
    addClearButton();

    var loaded = await loadPhotosFromStorage();
    if (loaded) {
        console.log(photoKeys.length + ' fotos disponibles en almacenamiento local.');
    }
}

async function displayNextImage() {
    if (photoKeys.length === 0) return;

    var key;
    if (photoKeys.length > 1 && currentKey !== -1) {
        do {
            key = photoKeys[Math.floor(Math.random() * photoKeys.length)];
        } while (key === currentKey);
    } else {
        key = photoKeys[Math.floor(Math.random() * photoKeys.length)];
    }

    currentKey = key;

    try {
        var url = await loadPhotoByKey(key);
        if (!url) return;

        revokeCurrentUrl();
        currentPhotoUrl = url;

        slideshowImageElement.classList.remove('active');
        setTimeout(function() {
            slideshowImageElement.src = currentPhotoUrl;
            slideshowImageElement.classList.add('active');
        }, 1500);
    } catch (e) {
        console.error('Error cargando foto:', e);
    }
}

export function startSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }

    if (photoKeys.length > 0) {
        displayNextImage();
        slideshowIntervalId = setInterval(displayNextImage, 15000);
    } else {
        document.getElementById('slideshowToggle').checked = false;
        document.getElementById('slideshow-display').classList.add('hidden');
        document.getElementById('main-app-content').classList.remove('hidden');
        alert('Primero añade fotos con el botón ➕.');
    }
}

export function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
    }
    revokeCurrentUrl();
    currentKey = -1;
    if (slideshowImageElement) {
        slideshowImageElement.classList.remove('active');
        setTimeout(function() {
            slideshowImageElement.src = '';
        }, 1500);
    }
}

export async function clearAllPhotos() {
    stopSlideshow();
    await clearPhotos();
    photoKeys = [];
}
