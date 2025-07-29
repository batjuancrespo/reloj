// Alarm module using Web Audio API

let alarms = [];
let audioCtx;
let alarmBuffer;
let currentSource = null; // To keep track of the playing source node

// Internal state for time selection
let currentSelectedHour = 7;
let currentSelectedMinute = 30;

// --- MODIFICACIÓN AQUÍ ---
// Generar dinámicamente la lista de 16 imágenes de alarma
const alarmImages = [];
for (let i = 1; i <= 16; i++) {
    // La ruta sigue el formato: ./alarm_image_ (1).png, ./alarm_image_ (2).png, etc.
    alarmImages.push(`./alarm_image_ (${i}).png`);
}

// Utility function (duplicated from app.js as it's needed here for displaying time)
function pad(num) { return ('0' + num).slice(-2); }

/**
 * Initializes the alarm system by loading the sound.
 * @param {string} soundUrl The URL of the alarm sound.
 */
export async function initAlarmSystem(soundUrl) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    try {
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();
        alarmBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        console.log("Alarm sound loaded successfully.");
    } catch (e) {
        console.error("Error loading alarm sound:", e);
    }
    updateAlarmList(); // Initialize alarm list display
}

/**
 * Plays the alarm sound using Web Audio API.
 */
function playAlarm() {
    if (!alarmBuffer) {
        console.error("Alarm sound not loaded or buffer is empty.");
        return;
    }
    stopAlarmSound(); // Ensure any previous alarm is stopped before starting a new one

    currentSource = audioCtx.createBufferSource();
    currentSource.buffer = alarmBuffer;
    currentSource.loop = true; // Loop the sound
    currentSource.connect(audioCtx.destination);
    currentSource.start(0); // Play immediately
    console.log("Alarm playing...");
}

/**
 * Stops the currently playing alarm sound.
 */
export function stopAlarmSound() {
    if (currentSource) {
        currentSource.stop();
        currentSource.disconnect(); // Disconnect to allow garbage collection
        currentSource = null;
        console.log("Alarm stopped.");
    }
}

/**
 * Checks if any set alarm matches the current time and triggers it.
 */
export function checkAlarms() {
    const currentTime = moment().format('HH:mm');
    let alarmTriggered = false;

    alarms.forEach((alarm, index) => {
        if (alarm.time === currentTime && !alarm.triggered) {
            alarms[index].triggered = true; // Mark as triggered
            document.body.classList.add('alarming');
            playAlarm();
            alarmTriggered = true;
        }
    });

    // If an alarm was triggered, ensure the list is updated to reflect this (e.g., to show a 'stop' button if logic supported)
    if (alarmTriggered) {
        updateAlarmList();
    }
}

/**
 * Adds a new alarm. Only one alarm can be set at a time in this version.
 * @param {string} time - The alarm time in 'HH:mm' format.
 */
export function addAlarm(time) {
    // In this simplified version, only one alarm can be set
    if (alarms.length === 0) {
        // La lógica para seleccionar una imagen aleatoria no cambia, ahora simplemente funciona con una lista más grande.
        const randomImage = alarmImages[Math.floor(Math.random() * alarmImages.length)];
        alarms.push({ time: time, triggered: false, imageUrl: randomImage });
        updateAlarmList();
        console.log("Alarm set for:", time, "with image:", randomImage);
    } else {
        console.warn("Only one alarm can be set at a time. Please cancel the existing alarm first.");
    }
}

/**
 * Removes an alarm by its index.
 * @param {number} index - The index of the alarm to remove.
 */
export function removeAlarm(index) {
    if (index >= 0 && index < alarms.length) {
        // If the alarm being removed is the one currently alarming, stop it.
        if (alarms[index].triggered && document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
        alarms.splice(index, 1);
        updateAlarmList();
        console.log("Alarm removed.");
    }
}

/**
 * Updates the alarm list display in the DOM.
 */
export function updateAlarmList() {
    const list = document.getElementById('alarmList');
    const controls = document.querySelector('.alarm-controls');

    if (alarms.length > 0) {
        controls.style.display = 'none';
        // Use `onclick` for compatibility with desktop and mobile touch (though `ontouchend` was in original)
        list.innerHTML = alarms.map((a, i) => `
            <div class="alarm-item">
                <div class="alarm-image-container">
                    <img src="${a.imageUrl}" alt="Alarm background image">
                </div>
                <div class="alarm-info">
                    <span>${a.time}</span>
                    <button onclick="removeAlarm(${i})">Cancelar</button>
                </div>
            </div>
        `).join('');
    } else {
        controls.style.display = 'flex';
        list.innerHTML = '';
    }
}

/**
 * Updates the time display for the alarm setting UI, reflecting currentSelectedHour/Minute.
 */
export function updateTimeDisplay() {
    const h = pad(currentSelectedHour);
    const m = pad(currentSelectedMinute);
    document.getElementById('hourInput').value = h;
    document.getElementById('minuteInput').value = m;
    document.getElementById('selectedTime').textContent = h + ':' + m;
}

/**
 * Increments the selected hour.
 */
export function incrementHour() {
    currentSelectedHour = (currentSelectedHour + 1) % 24;
    updateTimeDisplay();
}

/**
 * Decrements the selected hour.
 */
export function decrementHour() {
    currentSelectedHour = (currentSelectedHour - 1 + 24) % 24; // Ensure positive result for modulo
    updateTimeDisplay();
}

/**
 * Increments the selected minute.
 */
export function incrementMinute() {
    currentSelectedMinute = (currentSelectedMinute + 1) % 60;
    updateTimeDisplay();
}

/**
 * Decrements the selected minute.
 */
export function decrementMinute() {
    currentSelectedMinute = (currentSelectedMinute - 1 + 60) % 60; // Ensure positive result for modulo
    updateTimeDisplay();
}
