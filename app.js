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

function updateBrightness() {
    const overlay = document.getElementById('brightness-overlay');
    const currentHour = moment().hour();
    const isNightTime = currentHour >= 22 || currentHour < 9;
    if (isNightTime) {
        overlay.classList.add('is-dimmed');
    } else {
        // Si no es de noche, nos aseguramos de quitar ambas clases de opacidad
        overlay.classList.remove('is-dimmed');
        overlay.classList.remove('is-temporarily-bright');
    }
}

// --- LÓGICA DE MODO AUTOMÁTICO (RELOJ/SLIDESHOW) ---

let inactivityTimer = null;
let userHasOverriddenMode = false;
let dimmerTimer = null; // Temporizador para el brillo temporal

let slideshowToggle, mainAppContent, slideshowDisplay;

function applyCurrentMode() {
    if (slideshowToggle.checked) {
        mainAppContent.classList.add('hidden');
        slideshowDisplay.classList.remove('hidden');
        startSlideshow();
    } else {
        slideshowDisplay.classList.add('hidden');
        mainAppContent.classList.remove('hidden');
        stopSlideshow();
    }
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log("5 minutos de inactividad. Volviendo al modo automático.");
        userHasOverriddenMode = false;
        autoManageMode();
    }, 5 * 60 * 1000);
}

function autoManageMode() {
    if (userHasOverriddenMode) return;

    const currentHour = moment().hour();
    const isDayTimeForSlideshow = currentHour >= 9 && currentHour < 21;

    if (slideshowToggle.checked !== isDayTimeForSlideshow) {
        console.log(`Modo automático: cambiando a ${isDayTimeForSlideshow ? 'marco de fotos' : 'reloj'}`);
        slideshowToggle.checked = isDayTimeForSlideshow;
        applyCurrentMode();
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

    // El listener de click del body ahora también gestiona el brillo temporal
    document.body.addEventListener('click', () => {
        // 1. Lógica para parar la alarma (existente)
        if (document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
        
        // 2. Lógica para reiniciar el timer de inactividad (existente)
        if (userHasOverriddenMode) {
            resetInactivityTimer();
        }

        // 3. LÓGICA: Brillo temporal en modo noche
        const overlay = document.getElementById('brightness-overlay');
        // Si la pantalla está en modo oscuro...
        if (overlay.classList.contains('is-dimmed')) {
            // ...cancelamos cualquier temporizador anterior para reiniciar la cuenta.
            clearTimeout(dimmerTimer);
            
            // ...añadimos la clase que reduce la opacidad.
            overlay.classList.add('is-temporarily-bright');
            
            // ...y programamos que se quite esa clase después de 7 segundos.
            dimmerTimer = setTimeout(() => {
                overlay.classList.remove('is-temporarily-bright');
            }, 7000); // 7 segundos
        }
    });

    // Slideshow System
    initSlideshow('slideshow-image', 'photoInput');
    slideshowToggle = document.getElementById('slideshowToggle');
    mainAppContent = document.getElementById('main-app-content');
    slideshowDisplay = document.getElementById('slideshow-display');

    slideshowToggle.addEventListener('change', () => {
        console.log("Modo cambiado manualmente por el usuario.");
        userHasOverriddenMode = true;
        applyCurrentMode();
        resetInactivityTimer();
    });
    
    // Brightness System
    updateBrightness();
    setInterval(updateBrightness, 60000);
    
    // Iniciar el gestor de modo automático
    autoManageMode();
    setInterval(autoManageMode, 60000);

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();
