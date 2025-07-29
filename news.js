// News module
export function createNewsRotator(containerId, feedSources) {
    const container = document.getElementById(containerId);
    let allNews = [];
    let lastNewsIndex = -1; // Para evitar repetir la misma noticia dos veces seguidas

    function fetchNews() {
        // Creamos una promesa para cada feed que nos han pasado
        const promises = feedSources.map(source =>
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`)
                .then(response => response.json())
                .then(data => ({ ...data, sourceName: source.name })) // Añadimos el nombre de la fuente a la respuesta
                .catch(error => {
                    console.error(`Error fetching news from ${source.name}:`, error);
                    return null; // Si un feed falla, no detenemos los demás
                })
        );

        // Cuando todas las promesas se resuelvan...
        Promise.all(promises).then(results => {
            const items = [];
            results.forEach(data => {
                // Comprobamos que el feed haya funcionado y tenga noticias
                if (data && data.status === 'ok' && data.items) {
                    // Cogemos los 10 primeros titulares y les añadimos el nombre de la fuente
                    data.items.slice(0, 10).forEach(item => {
                        items.push({ 
                            title: item.title, 
                            link: item.link,
                            source: data.sourceName // Guardamos la fuente
                        });
                    });
                }
            });

            if (items.length > 0) {
                allNews = items; // Actualizamos nuestro listado completo de noticias
                console.log(`Cargadas ${allNews.length} noticias para ${containerId}`);
                // Si es la primera carga, mostramos la primera noticia
                if (lastNewsIndex === -1) {
                    showNextNews(); 
                }
            }
        });
    }

    // --- FUNCIÓN DE MOSTRAR NOTICIA MODIFICADA PARA SER ALEATORIA ---
    function showNextNews() {
        if (allNews.length === 0) return;

        let newsItem = container.querySelector('.news-item');
        if (!newsItem) {
            newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            container.appendChild(newsItem);
        }

        newsItem.classList.remove('active');

        // Lógica para elegir un titular aleatorio sin repetir el anterior
        let randomIndex;
        if (allNews.length > 1) {
            do {
                randomIndex = Math.floor(Math.random() * allNews.length);
            } while (randomIndex === lastNewsIndex);
        } else {
            randomIndex = 0;
        }
        lastNewsIndex = randomIndex;
        
        const article = allNews[lastNewsIndex];

        setTimeout(() => {
            // Actualizamos el contenido para mostrar el titular y la fuente
            newsItem.innerHTML = `
                <a href="${article.link}" target="_blank">${article.title}</a>
                <span class="news-source">${article.source}</span>
            `;
            
            void newsItem.offsetWidth;
            newsItem.classList.add('active');
        }, 500);

    }

    // Carga inicial y configuración de los intervalos
    fetchNews();
    setInterval(fetchNews, 600000); // 600000 ms = 10 minutos
    setInterval(showNextNews, 8000); // Cambia de noticia cada 8 segundos
}
