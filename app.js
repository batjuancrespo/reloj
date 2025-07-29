import { updateWeatherDisplay } from './weather.js';
import { createNewsRotator } from './news.js';
import { initQuotes } from './quotes.js';
import { initAlarmSystem, addAlarm, removeAlarm, updateTimeDisplay, checkAlarms, stopAlarmSound, incrementHour, decrementHour, incrementMinute, decrementMinute } from './alarm.js';
import { initSlideshow, startSlideshow, stopSlideshow } from './slideshow.js';

// Moment.js is globally available via CDN scripts in index.html
moment.locale('es');

// Utility function (could be in a separate utils.js if more are added)
function pad(num) { return ('0' + num).slice(-2); }

function updateClock() {
    document.getElementById('clock').textContent = moment().format('HH:mm');
    document.getElementById('current-date').textContent = moment().format('dddd, D [de] MMMM');
}

// Global function to remove alarm, called from inline HTML (simplified interaction)
window.removeAlarm = (index) => {
    removeAlarm(index);
};

// --- Initialization ---
function init() {
    // Clock
    updateClock();
    setInterval(updateClock, 15000);

    // Quotes
    initQuotes();

    // Weather
    const WEATHER_LAT = 43.2;
    const WEATHER_LON = -3.8;
    // Recuerda poner aquí tu API Key de OpenWeatherMap si la que tienes deja de funcionar.
    const WEATHER_API_KEY = '509d6e285322730dccee6fe6f659ec68';
    updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY);
    setInterval(() => updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY), 1800000);

    // Definition of the news feeds with the latest requested URLs
    const generalNewsFeeds = [
        { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml' },
        { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ultimas-noticias/portada' },
        { name: 'El Diario Montañés', url: 'https://www.eldiariomontanes.es/rss/2.0/portada/' }
    ];

    const sportsNewsFeeds = [
        { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/portada.xml' },
        { name: 'AS', url: 'https://as.com/rss/futbol/primera.xml' }
    ];

    createNewsRotator('generalNews', generalNewsFeeds);
    createNewsRotator('sportsNews', sportsNewsFeeds);

    // Alarm System
    initAlarmSystem('./mi_alarma.mp3');
    setInterval(checkAlarms, 1000);
    updateTimeDisplay();

    // Alarm UI Event Listeners
    document.getElementById('hourUp').addEventListener('click', incrementHour);
    document.getElementById('hourDown').addEventListener('click', decrementHour);
    document.getElementById('minuteUp').addEventListener('click', incrementMinute);
    document.getElementById('minuteDown').addEventListener('click', decrementMinute);

    document.getElementById('setAlarm').addEventListener('click', () => {
        const h = document.getElementById('hourInput').value;
        const m = document.getElementById('minuteInput').value;
        addAlarm(h + ':' + m);
    });

    // Stop alarm on any body click/touch
    document.body.addEventListener('click', () => {
        if (document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
    });

    // Slideshow System
    initSlideshow('slideshow-image', 'photoInput');
    const slideshowToggle = document.getElementById('slideshowToggle');
    const mainAppContent = document.getElementById('main-app-content');
    const slideshowDisplay = document.getElementById('slideshow-display');

    slideshowToggle.addEventListener('change', (event) => {
        if (event.target.checked) {
            mainAppContent.classList.add('hidden');
            slideshowDisplay.classList.remove('hidden');
            startSlideshow();
        } else {
            slideshowDisplay.classList.add('hidden');
            mainAppContent.classList.remove('hidden');
            stopSlideshow();
        }
    });

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();
