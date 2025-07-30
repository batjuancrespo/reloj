export function createNewsRotator(containerId, sources) {
    const container = document.getElementById(containerId);
    let allNews = [];
    let lastNewsIndex = -1;

    function fetchNews() {
        console.log(`Actualizando noticias para ${containerId}...`);

        let promises;

        // --- LÓGICA HÍBRIDA ---
        if (sources === 'scraper') {
            // Si las fuentes son del scraper, hacemos una sola petición a nuestro JSON.
            // La URL apunta directamente al archivo en tu repositorio.
            // Añadimos un timestamp para evitar problemas de caché del navegador.
            const url = `titulares.json?v=${new Date().getTime()}`;
            promises = [
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error('Error fetching scraped news:', error);
                        // En caso de error, muestra un mensaje útil.
                        return [{ title: "Cargando titulares deportivos...", source: "Scraper" }];
                    })
            ];
        } else {
            // Si son feeds RSS, usamos la lógica anterior.
            promises = sources.map(source =>
                fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`)
                    .then(response => response.json())
                    .then(data => {
                        const items = [];
                        if (data && data.status === 'ok' && data.items) {
                            data.items.slice(0, 10).forEach(item => {
                                items.push({ 
                                    title: item.title, 
                                    link: item.link,
                                    source: source.name
                                });
                            });
                        }
                        return items;
                    })
                    .catch(error => {
                        console.error(`Error fetching RSS feed from ${source.name}:`, error);
                        return [];
                    })
            );
        }

        Promise.all(promises).then(results => {
            // El método .flat() aplana el array de arrays en uno solo.
            allNews = results.flat(); 
            
            if (allNews.length > 0) {
                console.log(`Carga completa. Total de ${allNews.length} noticias para ${containerId}`);
                if (lastNewsIndex === -1) {
                    showNextNews(); 
                }
            } else {
                 console.log(`No se cargaron noticias para ${containerId}`);
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

    fetchNews();
    setInterval(fetchNews, 600000); // 10 minutos
    setInterval(showNextNews, 8000); // 8 segundos
}
