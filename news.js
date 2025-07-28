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
                showNextNews();
            }
        });
    }

    function showNextNews() {
        if (allNews.length === 0) return;

        // Remove old news item with a fade out effect if desired, or just remove immediately
        const oldNewsItem = container.querySelector('.news-item');
        if (oldNewsItem) {
            oldNewsItem.classList.remove('active');
            // Give a short delay for transition to complete before removal
            setTimeout(() => {
                if (oldNewsItem.parentNode) {
                    oldNewsItem.parentNode.removeChild(oldNewsItem);
                }
            }, 500);
        }

        const article = allNews[currentIndex];
        const newItem = document.createElement('div');
        newItem.className = 'news-item';
        newItem.innerHTML = `<a href="${article.link}" target="_blank">${article.title}</a>`;
        container.appendChild(newItem);

        // Trigger reflow to ensure transition works
        void newItem.offsetWidth;
        newItem.classList.add('active');

        currentIndex = (currentIndex + 1) % allNews.length;
    }

    // Initial fetch and set up intervals
    fetchNews();
    setInterval(fetchNews, 600000); // Fetch new news every 10 minutes
    setInterval(showNextNews, 8000); // Rotate news every 8 seconds
}

