// Slideshow module

let currentImageIndex = 0;
let slideshowIntervalId = null;
let slideshowImageElement = null;

// Variable para guardar las URLs de los objetos de las imágenes locales
let localImageUrls = [];

/**
 * Función que maneja la selección de archivos del input.
 * Se ejecuta cuando el evento 'change' del input se dispara.
 * @param {Event} event - El objeto del evento 'change'.
 */
function handleFileSelection(event) {
    // Obtenemos la lista de archivos seleccionados por el usuario.
    const files = event.target.files;

    if (!files || files.length === 0) {
        console.log("No se seleccionó ningún archivo.");
        return;
    }

    // Antes de cargar nuevas imágenes, limpiamos las antiguas para liberar memoria.
    localImageUrls.forEach(url => URL.revokeObjectURL(url));
    localImageUrls = [];

    // Iteramos sobre la lista de archivos (que no es un array estándar).
    for (const file of files) {
        // Nos aseguramos de que solo procesamos archivos de tipo imagen.
        if (file.type.startsWith('image/')) {
            // Creamos una URL temporal en memoria para el archivo.
            const objectURL = URL.createObjectURL(file);
            localImageUrls.push(objectURL);
        }
    }
    
    if (localImageUrls.length > 0) {
        // Informa al usuario de que la carga fue exitosa.
        alert(`Se han cargado ${localImageUrls.length} imágenes. Ahora puedes activar el marco de fotos.`);
        console.log(`Se han cargado ${localImageUrls.length} imágenes.`);
        
        // --- MODIFICACIÓN: Ocultar el botón después de la selección ---
        const photoSelectButton = document.getElementById('photoSelectLabel');
        if (photoSelectButton) {
            photoSelectButton.style.display = 'none';
        }
        
        // Si el slideshow ya estaba activo, lo reiniciamos con las nuevas fotos.
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
 * @param {string} imageElementId The ID of the <img> element.
 * @param {string} inputElementId The ID of the <input type="file"> element.
 */
export function initSlideshow(imageElementId, inputElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) {
        console.error(`Elemento de imagen para slideshow con ID '${imageElementId}' no encontrado.`);
        return;
    }

    const photoInput = document.getElementById(inputElementId);
    if (photoInput) {
        // Asigna la función que maneja los archivos al evento 'change' del input.
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

    // Efecto de fundido de salida
    slideshowImageElement.classList.remove('active');

    // Espera a que termine la transición de fundido antes de cambiar la imagen
    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % localImageUrls.length;
        slideshowImageElement.src = localImageUrls[currentImageIndex];
        // Efecto de fundido de entrada
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
        currentImageIndex = 0;
        slideshowImageElement.src = localImageUrls[currentImageIndex];
        slideshowImageElement.classList.add('active'); 

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
