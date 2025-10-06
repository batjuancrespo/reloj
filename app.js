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

// --- NUEVA LÓGICA: GESTIÓN AUTOMÁTICA DE MODO (RELOJ/SLIDESHOW) ---

let inactivityTimer = null;
let userHasOverriddenMode = false; // Para saber si el usuario ha cambiado el modo manualmente

// Referencias a los elementos que necesitaremos, se asignarán en init()
let slideshowToggle, mainAppContent, slideshowDisplay;

/**
 * Función centralizada para cambiar entre el modo reloj y el modo slideshow.
 * @param {'slideshow' | 'clock'} mode - El modo al que se quiere cambiar.
 */
function setAppMode(mode) {
    const isSlideshowMode = (mode === 'slideshow');
    
    // Solo cambia si el estado actual es diferente para evitar acciones innecesarias
    if (slideshowToggle.checked === isSlideshowMode) return;

    slideshowToggle.checked = isSlideshowMode;
    if (isSlideshowMode) {
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
 * Reinicia el temporizador de inactividad. Se llama cada vez que el usuario interactúa.
 */
function resetInactivityTimer() {
    clearTimeout(inactivityTimer); // Cancela el temporizador anterior
    // Inicia un nuevo temporizador de 5 minutos
    inactivityTimer = setTimeout(() => {
        console.log("5 minutos de inactividad. Volviendo al modo automático.");
        userHasOverriddenMode = false; // El control vuelve al modo automático
        autoManageMode(); // Forza la comprobación y el cambio si es necesario
    }, 5 * 60 * 1000); // 5 minutos en milisegundos
}

/**
 * Comprueba la hora y establece el modo por defecto si el usuario no ha intervenido.
 */
function autoManageMode() {
    // Si el usuario ha tomado el control, esta función no hace nada.
    if (userHasOverriddenMode) {
        return;
    }

    const currentHour = moment().hour();
    
    // El modo marco de fotos es entre las 9:00 y las 20:59 (antes de las 9 PM)
    const isDayTimeForSlideshow = currentHour >= 9 && currentHour < 21;
    
    const desiredMode = isDayTimeForSlideshow ? 'slideshow' : 'clock';
    
    setAppMode(desiredMode);
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
        // Stop alarm on any body click/touch
        if (document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
        // --- NUEVO: Reinicia el timer si el usuario ha tomado el control
        if (userHasOverriddenMode) {
            resetInactivityTimer();
        }
    });

    // Slideshow System
    initSlideshow('slideshow-image', 'photoInput');
    // --- NUEVO: Obtenemos las referencias a los elementos del DOM
    slideshowToggle = document.getElementById('slideshowToggle');
    mainAppContent = document.getElementById('main-app-content');
    slideshowDisplay = document.getElementById('slideshow-display');

    // --- MODIFICADO: El listener del switch ahora gestiona el estado de anulación del usuario
    slideshowToggle.addEventListener('change', (event) => {
        userHasOverriddenMode = true; // El usuario ha tomado el control
        setAppMode(event.target.checked ? 'slideshow' : 'clock');
        resetInactivityTimer(); // Inicia el contador de 5 minutos
        console.log("Modo cambiado manualmente por el usuario. El modo automático se reanudará en 5 minutos de inactividad.");
    });
    
    // Brightness System
    updateBrightness();
    setInterval(updateBrightness, 60000);
    
    // --- NUEVO: Iniciar el gestor de modo automático
    autoManageMode(); // Comprueba el modo correcto al cargar la página
    setInterval(autoManageMode, 60000); // Comprueba cada minuto

    console.log("Smart Clock Initialized. High Visibility Version.");
}

// Start the application
init();
