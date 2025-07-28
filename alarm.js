// Alarm module using Web Audio API

let alarms = [];
let audioCtx;
let alarmBuffer;
let currentSource = null; // To keep track of the playing source node

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
        alarms.push({ time: time, triggered: false });
        updateAlarmList();
        console.log("Alarm set for:", time);
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
                <span>${a.time}</span>
                <button onclick="removeAlarm(${i})">Cancelar</button>
            </div>
        `).join('');
    } else {
        controls.style.display = 'flex';
        list.innerHTML = '';
    }
}

/**
 * Updates the time display for the alarm setting UI.
 */
export function updateTimeDisplay() {
    const h = pad(document.getElementById('hourSlider').value);
    const m = pad(document.getElementById('minuteSlider').value);
    document.getElementById('selectedTime').textContent = h + ':' + m;
}

