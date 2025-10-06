import { updateWeatherDisplay } from './weather.js';
import { initInfoRotator } from './infoRotator.js';
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

// --- Función para gestionar el brillo de la pantalla ---
function updateBrightness() {
    const overlay = document.getElementById('brightness-overlay');
    const currentHour = moment().hour();

    // Atenuar la pantalla entre las 10 PM y las 9 AM
    const isNightTime = currentHour >= 22 || currentHour < 9; // <-- ¡CAMBIO REALIZADO AQUÍ!

    if (isNightTime) {
        overlay.classList.add('is-dimmed');
    } else {
        overlay.classList.remove('is-dimmed');
    }
}

// --- Initialization ---
function init() {
    // Clock
    updateClock();
    setInterval(updateClock, 15000);

    // Weather
    const WEATHER_LAT = 43.2;
    const WEATHER_LON = -3.8;
    const WEATHER_API_KEY = '509d6e285322730dccee6fe6f659ec68'; 
    updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY);
    setInterval(() => updateWeatherDisplay(WEATHER_LAT, WEATHER_LON, WEATHER_API_KEY), 1800000);

    // Info Rotator
    initInfoRotator('info-rotator-content');

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
    
    // --- Activar el sistema de brillo ---
    updateBrightness(); // Comprueba el brillo al iniciar
    setInterval(updateBrightness, 60000); // Y luego comprueba cada minuto

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();
