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
        overlay.classList.remove('is-dimmed');
    }
}

// --- LÓGICA CORREGIDA: GESTIÓN AUTOMÁTICA DE MODO (RELOJ/SLIDESHOW) ---

let inactivityTimer = null;
let userHasOverriddenMode = false;

let slideshowToggle, mainAppContent, slideshowDisplay;

/**
 * Aplica los cambios visuales basados en el estado actual del interruptor.
 * Esta es la única función que debe cambiar la visibilidad de los elementos.
 */
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

/**
 * Reinicia el temporizador de inactividad de 5 minutos.
 */
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log("5 minutos de inactividad. Volviendo al modo automático.");
        userHasOverriddenMode = false;
        autoManageMode();
    }, 5 * 60 * 1000); // 5 minutos
}

/**
 * Comprueba la hora y establece el modo por defecto si el usuario no ha intervenido.
 */
function autoManageMode() {
    if (userHasOverriddenMode) {
        return; // El usuario tiene el control, no hacemos nada.
    }

    const currentHour = moment().hour();
    // Modo marco de fotos: de 9:00 a 20:59 (antes de las 9 PM / 21:00)
    const isDayTimeForSlideshow = currentHour >= 9 && currentHour < 21;

    // Solo actuamos si el estado actual es incorrecto
    if (slideshowToggle.checked !== isDayTimeForSlideshow) {
        console.log(`Modo automático: cambiando a ${isDayTimeForSlideshow ? 'marco de fotos' : 'reloj'}`);
        slideshowToggle.checked = isDayTimeForSlideshow; // Cambiamos el estado del interruptor
        applyCurrentMode(); // Aplicamos los cambios visuales
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

    document.body.addEventListener('click', () => {
        if (document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
        if (userHasOverriddenMode) {
            resetInactivityTimer();
        }
    });

    // Slideshow System
    initSlideshow('slideshow-image', 'photoInput');
    slideshowToggle = document.getElementById('slideshowToggle');
    mainAppContent = document.getElementById('main-app-content');
    slideshowDisplay = document.getElementById('slideshow-display');

    // Listener del interruptor: ahora mucho más simple y correcto.
    slideshowToggle.addEventListener('change', () => {
        console.log("Modo cambiado manualmente por el usuario.");
        userHasOverriddenMode = true;
        applyCurrentMode(); // Simplemente aplica el nuevo estado del interruptor
        resetInactivityTimer();
    });
    
    // Brightness System
    updateBrightness();
    setInterval(updateBrightness, 60000);
    
    // Iniciar el gestor de modo automático
    autoManageMode(); // Comprueba el modo correcto al cargar la página
    setInterval(autoManageMode, 60000); // Comprueba cada minuto

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();
