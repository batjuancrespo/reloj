import { updateWeatherDisplay } from './weather.js';
import { createNewsRotator } from './news.js';
import { updateQuote } from './quotes.js';
import { initAlarmSystem, addAlarm, removeAlarm, updateTimeDisplay, checkAlarms, stopAlarmSound } from './alarm.js';

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

    // Alarm UI Event Listeners
    document.getElementById('hourSlider').addEventListener('input', updateTimeDisplay);
    document.getElementById('minuteSlider').addEventListener('input', updateTimeDisplay);

    document.getElementById('setAlarm').addEventListener('click', () => {
        const h = pad(document.getElementById('hourSlider').value);
        const m = pad(document.getElementById('minuteSlider').value);
        addAlarm(h + ':' + m);
    });

    // Stop alarm on any body click/touch
    document.body.addEventListener('click', () => {
        if (document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
    });

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();

