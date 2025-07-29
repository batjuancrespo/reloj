// Quotes module

// Esta variable guardará todas las frases una vez que se carguen del archivo.
let allQuotes = [];

/**
 * Función asíncrona para cargar las frases desde el archivo quotes.json
 */
async function loadQuotes() {
    try {
        const response = await fetch('./quotes.json'); // Petición para obtener el archivo
        if (!response.ok) {
            // Si hay un error (ej: archivo no encontrado), lo mostramos en consola.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allQuotes = await response.json(); // Convertimos la respuesta en un array de JavaScript
        console.log(`Se han cargado ${allQuotes.length} frases célebres.`);
    } catch (error) {
        console.error("No se pudieron cargar las frases:", error);
        // Opcional: Mostrar un mensaje de error en la pantalla
        const quoteTextEl = document.querySelector('.quote-text');
        quoteTextEl.textContent = "Error al cargar las frases.";
    }
}

/**
 * Función principal para inicializar el sistema de frases.
 * Carga las frases y luego empieza a mostrarlas.
 */
export async function initQuotes() {
    // Primero, esperamos a que todas las frases se hayan cargado.
    await loadQuotes();

    // Si se cargaron frases, mostramos la primera y activamos el carrusel.
    if (allQuotes.length > 0) {
        updateQuote(); // Muestra la primera frase inmediatamente.
        setInterval(updateQuote, 20000); // Cambia la frase cada 20 segundos.
    }
}


/**
 * Muestra una nueva frase aleatoria en la pantalla.
 */
export function updateQuote() {
    // Si por alguna razón no hay frases cargadas, no hace nada.
    if (allQuotes.length === 0) {
        return;
    }

    const contentWrapper = document.querySelector('#quote-section .quote-content');
    const quoteTextEl = document.querySelector('.quote-text');
    const quoteAuthorEl = document.querySelector('.quote-author');

    // Reinicia la animación
    contentWrapper.classList.remove('animate');
    void contentWrapper.offsetWidth;

    // Elige una frase aleatoria del gran listado cargado
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const randomQuote = allQuotes[randomIndex];
    quoteTextEl.textContent = '"' + randomQuote.text + '"';
    quoteAuthorEl.textContent = '- ' + randomQuote.author;

    // Vuelve a aplicar la animación
    contentWrapper.classList.add('animate');
}
