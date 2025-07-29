// Slideshow module

let currentImageIndex = 0;
let slideshowIntervalId = null;
let slideshowImageElement = null;

// Variable para guardar las URLs de los objetos de las imágenes locales
let localImageUrls = [];

/**
 * Función asíncrona para que el usuario seleccione un directorio local.
 * Utiliza la File System Access API.
 */
async function selectLocalPhotoDirectory() {
    try {
        // 1. Abre el selector de directorio nativo del sistema operativo.
        // Esto devuelve un "handle" o manejador para el directorio.
        const directoryHandle = await window.showDirectoryPicker();
        
        // Antes de cargar nuevas imágenes, limpiamos las antiguas para liberar memoria.
        localImageUrls.forEach(url => URL.revokeObjectURL(url));
        localImageUrls = [];

        // 2. Itera sobre todos los archivos y carpetas dentro del directorio seleccionado.
        for await (const entry of directoryHandle.values()) {
            // Solo nos interesan los archivos, no los subdirectorios.
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                // 3. Filtra para quedarnos solo con archivos que sean imágenes.
                if (file.type.startsWith('image/')) {
                    // 4. Crea una URL temporal en memoria para el archivo.
                    // Esta URL puede ser usada por la etiqueta <img> en su atributo 'src'.
                    const objectURL = URL.createObjectURL(file);
                    localImageUrls.push(objectURL);
                }
            }
        }

        if (localImageUrls.length > 0) {
            // Informa al usuario de que la carga fue exitosa.
            alert(`Se han cargado ${localImageUrls.length} imágenes. Ahora puedes activar el marco de fotos.`);
            console.log(`Se encontraron ${localImageUrls.length} imágenes.`);
            
            // Opcional: Si el slideshow ya estaba activo, lo reiniciamos con las nuevas fotos.
            if (slideshowIntervalId) {
                stopSlideshow();
                startSlideshow();
            }
        } else {
            alert("No se encontraron imágenes en la carpeta seleccionada.");
        }

    } catch (err) {
        // Este bloque se ejecuta si el usuario cancela la selección o si ocurre un error.
        console.error("Error al seleccionar la carpeta (es normal si el usuario cancela):", err.name, err.message);
    }
}

/**
 * Initializes the slideshow by setting up the image element and the folder selection button.
 * @param {string} imageElementId The ID of the <img> element.
 * @param {string} buttonElementId The ID of the button to select the folder.
 */
export function initSlideshow(imageElementId, buttonElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) {
        console.error(`Elemento de imagen para slideshow con ID '${imageElementId}' no encontrado.`);
        return;
    }

    const selectFolderButton = document.getElementById(buttonElementId);
    if (selectFolderButton) {
        // Asigna la función de selección de carpeta al evento 'click' del botón.
        selectFolderButton.addEventListener('click', selectLocalPhotoDirectory);
    } else {
        console.error(`Botón de selección de carpeta con ID '${buttonElementId}' no encontrado.`);
    }
}

/**
 * Displays the next image in the slideshow with a fade effect.
 */
function displayNextImage() {
    // Ahora la única fuente de imágenes es la lista local.
    if (!slideshowImageElement || localImageUrls.length === 0) return;

    // Efecto de fundido de salida
    slideshowImageElement.classList.remove('active');

    // Espera a que termine la transición de fundido antes de cambiar la imagen
    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % localImageUrls.length;
        slideshowImageElement.src = localImageUrls[currentImageIndex];
        // Efecto de fundido de entrada
        slideshowImageElement.classList.add('active');
    }, 1000); // Este tiempo debe coincidir con la duración de la transición en CSS.
}

/**
 * Starts the slideshow.
 */
export function startSlideshow() {
    // Si ya hay un slideshow en marcha, lo detenemos primero.
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }
    
    // Comprueba si se han cargado fotos locales.
    if (localImageUrls.length > 0) {
        // Asegura que la primera imagen se muestre inmediatamente.
        currentImageIndex = 0;
        slideshowImageElement.src = localImageUrls[currentImageIndex];
        slideshowImageElement.classList.add('active'); 

        // Inicia el intervalo para cambiar de imagen.
        slideshowIntervalId = setInterval(displayNextImage, 8000);
        console.log("Slideshow iniciado con fotos locales.");
    } else {
        // Si no hay fotos, avisa al usuario y desactiva el interruptor.
        alert("Por favor, selecciona primero una carpeta con fotos usando el botón 'Seleccionar Carpeta'.");
        document.getElementById('slideshowToggle').checked = false;
        // Restaura la vista principal de la aplicación.
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
        // Espera a la transición antes de borrar la fuente de la imagen.
        setTimeout(() => {
            slideshowImageElement.src = ''; 
        }, 1000);
    }
}
