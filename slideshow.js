import { savePhotos, loadPhotos, clearPhotos } from './photoStorage.js';

let slideshowIntervalId = null;
let slideshowImageElement = null;
let localImageUrls = [];
let lastImageIndex = -1;

function revokeAllUrls() {
    localImageUrls.forEach(url => URL.revokeObjectURL(url));
    localImageUrls = [];
    lastImageIndex = -1;
}

async function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    revokeAllUrls();

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        localImageUrls.push(URL.createObjectURL(file));
    }

    if (localImageUrls.length > 0) {
        try {
            await savePhotos(Array.from(files));
            alert(`Se han cargado y guardado ${localImageUrls.length} imágenes.`);
        } catch (e) {
            alert(`Fotos cargadas (${localImageUrls.length}) pero NO se guardaron en almacenamiento local: ` + e.message);
        }

        if (slideshowIntervalId) {
            stopSlideshow();
            startSlideshow();
        }
    } else {
        alert("Los archivos seleccionados no son imágenes válidas.");
    }
}

async function loadPhotosFromStorage() {
    try {
        const urls = await loadPhotos();
        if (urls.length === 0) return false;
        localImageUrls = urls;
        alert(`Cargadas ${urls.length} fotos del almacenamiento local.`);
        return true;
    } catch (e) {
        alert('Error al cargar fotos guardadas: ' + e.message);
        return false;
    }
}

function updateLabelToIcon() {
    const label = document.getElementById('photoSelectLabel');
    if (!label) return;
    label.className = 'icon-button';
    label.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    label.title = 'Añadir fotos';
}

function addClearButton() {
    const container = document.querySelector('.slideshow-controls-container');
    if (!container) return;

    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearPhotosBtn';
    clearBtn.className = 'icon-button';
    clearBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    clearBtn.title = 'Vaciar galería';
    clearBtn.addEventListener('click', async () => {
        if (localImageUrls.length === 0) return;
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

export async function initSlideshow(imageElementId, inputElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) return;

    const photoInput = document.getElementById(inputElementId);
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelection);
    }

    updateLabelToIcon();
    addClearButton();

    const loaded = await loadPhotosFromStorage();
    if (loaded) {
        console.log(`${localImageUrls.length} fotos cargadas de almacenamiento local.`);
    }
}

function displayNextImage() {
    if (!slideshowImageElement || localImageUrls.length === 0) return;

    let randomIndex;
    if (localImageUrls.length > 1) {
        do {
            randomIndex = Math.floor(Math.random() * localImageUrls.length);
        } while (randomIndex === lastImageIndex);
    } else {
        randomIndex = 0;
    }

    lastImageIndex = randomIndex;

    slideshowImageElement.classList.remove('active');
    setTimeout(() => {
        slideshowImageElement.src = localImageUrls[lastImageIndex];
        slideshowImageElement.classList.add('active');
    }, 1500);
}

export function startSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }

    if (localImageUrls.length > 0) {
        displayNextImage();
        slideshowIntervalId = setInterval(displayNextImage, 15000);
    } else {
        document.getElementById('slideshowToggle').checked = false;
        document.getElementById('slideshow-display').classList.add('hidden');
        document.getElementById('main-app-content').classList.remove('hidden');
        var count = localImageUrls.length;
        alert("Por favor, selecciona primero una o más fotos usando el botón '+'. (fotos ahora: " + count + ")");
    }
}

export function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
    }
    if (slideshowImageElement) {
        slideshowImageElement.classList.remove('active');
        setTimeout(() => {
            slideshowImageElement.src = '';
        }, 1500);
    }
}

export async function clearAllPhotos() {
    stopSlideshow();
    revokeAllUrls();
    await clearPhotos();
}
