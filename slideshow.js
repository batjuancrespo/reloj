import { appendPhotos, clearPhotos, hasStoredPhotos, loadRandomPhoto, getPhotoCount } from './photoStorage.js';

let slideshowIntervalId = null;
let slideshowImageElement = null;
let currentPhotoUrl = null;
let currentPhotoKey = undefined;
let photosLoaded = false;

function revokeCurrentUrl() {
    if (currentPhotoUrl) {
        URL.revokeObjectURL(currentPhotoUrl);
        currentPhotoUrl = null;
    }
}

async function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await appendPhotos(Array.from(files));
    photosLoaded = true;

    event.target.value = '';

    if (slideshowIntervalId) {
        displayNextImage();
    }
}

async function loadPhotosFromStorage() {
    const stored = await hasStoredPhotos();
    photosLoaded = true;
    return stored;
}

const PLUS_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const TRASH_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

function addClearButton() {
    const container = document.querySelector('.slideshow-controls-container');
    if (!container) return;

    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearPhotosBtn';
    clearBtn.className = 'icon-button';
    clearBtn.innerHTML = TRASH_ICON;
    clearBtn.title = 'Vaciar galería';
    clearBtn.addEventListener('click', async () => {
        if (getPhotoCount() === 0) return;
        if (confirm('¿Borrar todas las fotos de la galería?')) {
            await clearAllPhotos();
        }
    });

    const toggleContainer = container.querySelector('.toggle-switch-container');
    if (toggleContainer) {
        container.insertBefore(clearBtn, toggleContainer);
    } else {
        container.appendChild(clearBtn);
    }
}

function updateLabelToIcon() {
    const label = document.getElementById('photoSelectLabel');
    if (!label) return;
    label.className = 'icon-button';
    label.innerHTML = PLUS_ICON;
    label.title = 'Añadir fotos';
}

export async function initSlideshow(imageElementId, inputElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) {
        console.error(`Elemento de imagen para slideshow con ID '${imageElementId}' no encontrado.`);
        return;
    }

    const photoInput = document.getElementById(inputElementId);
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelection);
    }

    updateLabelToIcon();
    addClearButton();

    const loaded = await loadPhotosFromStorage();
    if (loaded) {
        console.log(`${getPhotoCount()} fotos cargadas automáticamente desde almacenamiento local.`);
    }
}

async function displayNextImage() {
    if (!slideshowImageElement || !photosLoaded) return;
    if (getPhotoCount() === 0) return;

    const result = await loadRandomPhoto(currentPhotoKey);
    if (!result) return;

    revokeCurrentUrl();
    currentPhotoUrl = result.url;
    currentPhotoKey = result.key;

    slideshowImageElement.classList.remove('active');
    setTimeout(() => {
        slideshowImageElement.src = currentPhotoUrl;
        slideshowImageElement.classList.add('active');
    }, 1500);
}

export function startSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }

    if (getPhotoCount() > 0) {
        displayNextImage();
        slideshowIntervalId = setInterval(displayNextImage, 15000);
    } else {
        document.getElementById('slideshowToggle').checked = false;
        document.getElementById('slideshow-display').classList.add('hidden');
        document.getElementById('main-app-content').classList.remove('hidden');
        alert("Primero añade fotos con el botón ➕.");
    }
}

export function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
    }
    revokeCurrentUrl();
    if (slideshowImageElement) {
        slideshowImageElement.classList.remove('active');
        setTimeout(() => {
            slideshowImageElement.src = '';
        }, 1500);
    }
}

export async function clearAllPhotos() {
    stopSlideshow();
    await clearPhotos();
    photosLoaded = false;
    currentPhotoKey = undefined;
}
