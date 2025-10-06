// --- NUEVO ARCHIVO: infoRotator.js ---

// Contenedores para las noticias y frases
let generalNews = [];
let sportsNews = [];
let quotes = [];

// El array combinado final que seguirá el patrón de rotación
let rotationItems = [];
let currentIndex = -1;

// Elemento del DOM donde se mostrará el contenido
let contentElement;

// Fuentes de noticias (copiadas de app.js)
const generalNewsFeeds = [
    { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml' },
    { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ultimas-noticias/portada' },
    { name: 'El Diario Montañés', url: 'https://www.eldiariomontanes.es/rss/2.0/portada/' }
];

/**
 * Obtiene las noticias generales desde las fuentes RSS.
 * @returns {Promise<Array>}
 */
async function fetchGeneralNews() {
    const promises = generalNewsFeeds.map(source =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.status === 'ok' && data.items) {
                    return data.items.slice(0, 10).map(item => ({
                        type: 'news',
                        title: item.title,
                        source: source.name
                    }));
                }
                return [];
            }).catch(error => {
                console.error(`Error fetching RSS feed from ${source.name}:`, error);
                return [];
            })
    );
    return Promise.all(promises).then(results => results.flat());
}

/**
 * Obtiene las noticias deportivas desde el archivo JSON local.
 * @returns {Promise<Array>}
 */
async function fetchSportsNews() {
    const url = `./titulares.json?v=${new Date().getTime()}`; // Evitar caché
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.map(item => ({ type: 'news', ...item }));
    } catch (error) {
        console.error('Error fetching scraped sports news:', error);
        return [{ type: 'news', title: "Cargando titulares deportivos...", source: "Scraper" }];
    }
}

/**
 * Carga las frases célebres desde el archivo JSON local.
 * @returns {Promise<Array>}
 */
async function fetchQuotes() {
    try {
        const response = await fetch('./quotes.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.map(item => ({ type: 'quote', ...item }));
    } catch (error) {
        console.error("Could not load quotes:", error);
        return [{ type: 'quote', text: "Error al cargar las frases.", author: "Sistema" }];
    }
}

/**
 * Construye la lista de rotación final siguiendo el patrón G->S->G->S->Q.
 */
function buildRotationList() {
    if (generalNews.length === 0 || sportsNews.length === 0 || quotes.length === 0) {
        console.log("Waiting for all data sources to be loaded...");
        return;
    }

    rotationItems = [];
    let gIndex = 0, sIndex = 0, qIndex = 0;
    
    // Construimos una lista larga para asegurar muchas rotaciones sin repetición inmediata
    const maxLength = Math.max(generalNews.length, sportsNews.length, quotes.length) * 5;

    for (let i = 0; i < maxLength; i++) {
        const sequenceIndex = i % 5; // 0, 1, 2, 3, 4, 0, 1, ...
        switch (sequenceIndex) {
            case 0:
            case 2:
                rotationItems.push(generalNews[gIndex]);
                gIndex = (gIndex + 1) % generalNews.length;
                break;
            case 1:
            case 3:
                rotationItems.push(sportsNews[sIndex]);
                sIndex = (sIndex + 1) % sportsNews.length;
                break;
            case 4:
                rotationItems.push(quotes[qIndex]);
                qIndex = (qIndex + 1) % quotes.length;
                break;
        }
    }
    console.log(`Rotation list built with ${rotationItems.length} items.`);
}

/**
 * Muestra el siguiente elemento en el panel con una transición suave.
 */
function showNextItem() {
    if (rotationItems.length === 0) return;

    // 1. Inicia la transición de salida (hacer invisible)
    contentElement.classList.remove('active');

    // 2. Espera a que la transición de salida termine
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % rotationItems.length;
        const item = rotationItems[currentIndex];
        let htmlContent = '';

        // 3. Actualiza el contenido del DOM
        if (item.type === 'news') {
            htmlContent = `
                <div class="info-title">${item.title}</div>
                <div class="info-source">${item.source}</div>
            `;
        } else if (item.type === 'quote') {
            htmlContent = `
                <div class="quote-text-large">"${item.text}"</div>
                <div class="quote-author-large">- ${item.author}</div>
            `;
        }
        contentElement.innerHTML = htmlContent;

        // Forzar un reflow del navegador, un truco para reiniciar la animación CSS
        void contentElement.offsetWidth;

        // 4. Inicia la transición de entrada (hacer visible)
        contentElement.classList.add('active');

    }, 750); // Este tiempo debe coincidir con la duración de la transición en CSS
}

/**
 * Función principal para inicializar el módulo.
 * @param {string} elementId - El ID del elemento que contendrá el contenido.
 */
export async function initInfoRotator(elementId) {
    contentElement = document.getElementById(elementId);
    if (!contentElement) {
        console.error("Info Rotator element not found!");
        return;
    }

    // Cargar todos los datos en paralelo
    [generalNews, sportsNews, quotes] = await Promise.all([
        fetchGeneralNews(),
        fetchSportsNews(),
        fetchQuotes()
    ]);

    // Construir la lista de rotación y empezar el ciclo
    buildRotationList();
    if (rotationItems.length > 0) {
        showNextItem(); // Muestra el primer elemento inmediatamente
        setInterval(showNextItem, 8000); // Cambia cada 8 segundos
    } else {
        contentElement.innerHTML = `<div class="info-title">No se pudo cargar el contenido.</div>`;
        contentElement.classList.add('active');
    }
}
