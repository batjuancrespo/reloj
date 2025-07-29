// Slideshow module

let slideshowIntervalId = null;
let slideshowImageElement = null;
let localImageUrls = [];

// --- MODIFICACIÓN: Añadida variable para recordar la última imagen mostrada ---
let lastImageIndex = -1;

/**
 * Función que maneja la selección de archivos del input.
 */
function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        console.log("No se seleccionó ningún archivo.");
        return;
    }

    localImageUrls.forEach(url => URL.revokeObjectURL(url));
    localImageUrls = [];
    lastImageIndex = -1; // Resetea el índice al cargar nuevas fotos

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const objectURL = URL.createObjectURL(file);
            localImageUrls.push(objectURL);
        }
    }
    
    if (localImageUrls.length > 0) {
        alert(`Se han cargado ${localImageUrls.length} imágenes. Ahora puedes activar el marco de fotos.`);
        console.log(`Se han cargado ${localImageUrls.length} imágenes.`);
        
        const photoSelectButton = document.getElementById('photoSelectLabel');
        if (photoSelectButton) {
            photoSelectButton.style.display = 'none';
        }
        
        if (slideshowIntervalId) {
            stopSlideshow();
            startSlideshow();
        }
    } else {
        alert("Los archivos seleccionados no son imágenes válidas.");
    }
}


/**
 * Initializes the slideshow by setting up the image element and the file input.
 */
export function initSlideshow(imageElementId, inputElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) {
        console.error(`Elemento de imagen para slideshow con ID '${imageElementId}' no encontrado.`);
        return;
    }

    const photoInput = document.getElementById(inputElementId);
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelection);
    } else {
        console.error(`Input de fotos con ID '${inputElementId}' no encontrado.`);
    }
}

/**
 * Displays the next image in the slideshow with a fade effect.
 */
function displayNextImage() {
    if (!slideshowImageElement || localImageUrls.length === 0) return;

    // --- MODIFICACIÓN CLAVE: Lógica para seleccionar una imagen aleatoria ---
    let randomIndex;
    // Si hay más de una imagen, busca un índice aleatorio que no sea el último.
    if (localImageUrls.length > 1) {
        do {
            randomIndex = Math.floor(Math.random() * localImageUrls.length);
        } while (randomIndex === lastImageIndex);
    } else {
        // Si solo hay una imagen, el índice siempre será 0.
        randomIndex = 0;
    }
    
    lastImageIndex = randomIndex; // Guarda el índice de la imagen que vamos a mostrar.

    slideshowImageElement.classList.remove('active');

    setTimeout(() => {
        slideshowImageElement.src = localImageUrls[lastImageIndex]; // Usa el nuevo índice aleatorio
        slideshowImageElement.classList.add('active');
    }, 1000);
}

/**
 * Starts the slideshow.
 */
export function startSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }
    
    if (localImageUrls.length > 0) {
        // Muestra la primera imagen inmediatamente (que será aleatoria)
        displayNextImage(); 

        // Inicia el intervalo para cambiar de imagen.
        slideshowIntervalId = setInterval(displayNextImage, 8000);
        console.log("Slideshow iniciado con fotos locales.");
    } else {
        alert("Por favor, selecciona primero una o más fotos usando el botón 'Seleccionar Fotos'.");
        document.getElementById('slideshowToggle').checked = false;
        document.getElementById('slideshow-display').classList.add('hidden');
        document.getElementById('main-app-content').classList.remove('hidden');
    }
}

/**
 * Stops the slideshow.
 */
export function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
        console.log("Slideshow detenido.");
    }
    if (slideshowImageElement) {
        slideshowImageElement.classList.remove('active');
        setTimeout(() => {
            slideshowImageElement.src = ''; 
        }, 1000);
    }
}
