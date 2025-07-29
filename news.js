// News module
export function createNewsRotator(containerId, feedSources) {
    const container = document.getElementById(containerId);
    let allNews = [];
    let lastNewsIndex = -1; // Para evitar repetir la misma noticia dos veces seguidas

    function fetchNews() {
        console.log(`Actualizando noticias para ${containerId}...`); // Mensaje de inicio de actualización
        const promises = feedSources.map(source =>
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`)
                .then(response => response.json())
                .then(data => ({ ...data, sourceName: source.name }))
                .catch(error => {
                    console.error(`Error fetching news from ${source.name}:`, error);
                    return null;
                })
        );

        Promise.all(promises).then(results => {
            const items = [];
            results.forEach(data => {
                if (data && data.status === 'ok' && data.items) {
                    
                    // --- MODIFICACIÓN PARA MOSTRAR TITULARES EN CONSOLA ---
                    
                    // 1. Obtenemos los 10 primeros items del feed
                    const topTenItems = data.items.slice(0, 10);

                    // 2. Imprimimos un encabezado para saber de qué periódico son
                    console.log(`--- Titulares cargados de: ${data.sourceName} ---`);

                    // 3. Recorremos esos 10 items para imprimirlos y añadirlos a la lista
                    topTenItems.forEach((item, index) => {
                        // Imprimimos el titular numerado en la consola
                        console.log(`  ${index + 1}. ${item.title}`);
                        
                        // Añadimos la noticia al array general que se usará en la app
                        items.push({ 
                            title: item.title, 
                            link: item.link,
                            source: data.sourceName
                        });
                    });
                    
                    console.log('-------------------------------------------'); // Separador para mayor claridad
                    // --- FIN DE LA MODIFICACIÓN ---

                }
            });

            if (items.length > 0) {
                allNews = items;
                console.log(`Carga completa. Total de ${allNews.length} noticias para ${containerId}`);
                if (lastNewsIndex === -1) {
                    showNextNews(); 
                }
            }
        });
    }
    
    function showNextNews() {
        if (allNews.length === 0) return;

        let newsItem = container.querySelector('.news-item');
        if (!newsItem) {
            newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            container.appendChild(newsItem);
        }

        newsItem.classList.remove('active');

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
    setInterval(fetchNews, 600000); // 10 minutos
    setInterval(showNextNews, 8000); // 8 segundos
}
