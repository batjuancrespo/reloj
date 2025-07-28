import { updateWeatherDisplay } from './weather.js';
import { createNewsRotator } from './news.js';
import { updateQuote } from './quotes.js';
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
    setInterval(updateClock, 15000); // Update clock every 15 seconds

    // Quotes
    updateQuote();
    setInterval(updateQuote, 20000); // Change quote every 20 seconds

    // Weather
    const WEATHER_LAT = 43.2;
    const WEATHER_LON = -3.8;
    const WEATHER_API_KEY = '56463b4abd4cb828b6db3c8395dcedbc'; // Keep your API key private in production
    updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY);
    setInterval(() => updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY), 1800000); // Update weather every 30 minutes

    // News
    createNewsRotator('generalNews', ['https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', 'https://www.eldiariomontanes.es/rss/2.0/?section=ultima-hora']);
    createNewsRotator('sportsNews', ['https://e00-marca.uecdn.es/rss/futbol/primera-division.xml', 'https://www.eldiariomontanes.es/rss/2.0/?section=deportes']);

    // Alarm System
    initAlarmSystem('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    setInterval(checkAlarms, 1000); // Check alarms every second
    updateTimeDisplay(); // Initial display of selected alarm time

    // Alarm UI Event Listeners for new tactile controls
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
    initSlideshow('slideshow-image'); // Initialize with the ID of the image element
    const slideshowToggle = document.getElementById('slideshowToggle');
    const mainAppContent = document.getElementById('main-app-content');
    const slideshowDisplay = document.getElementById('slideshow-display');

    slideshowToggle.addEventListener('change', (event) => {
        if (event.target.checked) {
            // Switch to slideshow mode
            mainAppContent.classList.add('hidden');
            slideshowDisplay.classList.remove('hidden');
            startSlideshow();
        } else {
            // Switch back to main app mode
            slideshowDisplay.classList.add('hidden');
            mainAppContent.classList.remove('hidden');
            stopSlideshow();
        }
    });

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();