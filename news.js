// News module
export function createNewsRotator(containerId, feeds) {
    const container = document.getElementById(containerId);
    let allNews = [];
    let currentIndex = 0;

    function fetchNews() {
        const promises = feeds.map(feedUrl =>
            fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl))
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching news from ${feedUrl}:`, error);
                    return null;
                })
        );

        Promise.all(promises).then(results => {
            const items = [];
            results.forEach(data => {
                if (data && data.status === 'ok' && data.items) {
                    // Take the first 5 items from each feed to prevent too many news
                    data.items.slice(0, 5).forEach(item => {
                        items.push({ title: item.title, link: item.link });
                    });
                }
            });

            if (items.length > 0) {
                allNews = items;
                currentIndex = 0; // Reset index when news are updated
                showNextNews(); // Muestra la primera noticia inmediatamente
            }
        });
    }
    
    // --- FUNCIÓN MODIFICADA Y CORREGIDA ---
    function showNextNews() {
        if (allNews.length === 0) return;

        // Buscamos si ya existe un elemento para las noticias.
        let newsItem = container.querySelector('.news-item');
        // Si no existe (es la primera vez), lo creamos.
        if (!newsItem) {
            newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            container.appendChild(newsItem);
        }

        // 1. Animamos la salida del titular actual.
        newsItem.classList.remove('active');

        // Obtenemos el nuevo artículo que vamos a mostrar.
        const article = allNews[currentIndex];

        // 2. Esperamos a que la animación de salida termine (500ms) antes de cambiar el contenido.
        // Esto evita la superposición y asegura que el proceso sea secuencial.
        setTimeout(() => {
            // 3. Actualizamos el contenido del MISMO elemento. No creamos uno nuevo.
            newsItem.innerHTML = `<a href="${article.link}" target="_blank">${article.title}</a>`;

            // Forzamos un 'reflow' del navegador. Es un truco para asegurar que la animación se reinicie.
            void newsItem.offsetWidth;

            // 4. Animamos la entrada del nuevo titular.
            newsItem.classList.add('active');
        }, 500); // IMPORTANTE: Este tiempo debe ser igual a la duración de la transición en style.css

        // 5. Preparamos el índice para la siguiente noticia.
        currentIndex = (currentIndex + 1) % allNews.length;
    }

    // Initial fetch and set up intervals
    fetchNews();
    // No llamamos a showNextNews aquí, fetchNews ya lo hace la primera vez.
    setInterval(fetchNews, 600000); // Fetch new news every 10 minutes
    setInterval(showNextNews, 8000); // Rotate news every 8 seconds
}
