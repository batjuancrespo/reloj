let alarms = [];
let audioCtx = null;
let alarmBuffer = null;
let currentSource = null;

let currentSelectedHour = 6;
let currentSelectedMinute = 42;

const alarmImages = [];
for (let i = 1; i <= 16; i++) {
    alarmImages.push(`./alarm_image_ (${i}).png`);
}

function pad(num) { return ('0' + num).slice(-2); }

export async function initAlarmSystem(soundUrl) {
    try {
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        alarmBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        // Suspender el contexto hasta que se necesite
        if (audioCtx.state === 'running') {
            audioCtx.suspend();
        }
    } catch (e) {
        console.error("Error loading alarm sound:", e);
        alarmBuffer = null;
    }
    updateAlarmList();
}

function playAlarm() {
    if (!alarmBuffer || !audioCtx) return;

    stopAlarmSound();

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    currentSource = audioCtx.createBufferSource();
    currentSource.buffer = alarmBuffer;
    currentSource.loop = true;
    currentSource.connect(audioCtx.destination);
    currentSource.start(0);
}

export function stopAlarmSound() {
    if (currentSource) {
        try {
            currentSource.stop();
            currentSource.disconnect();
        } catch (e) {
            // Ignorar errores si ya estaba detenido
        }
        currentSource = null;
    }
    if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
    }
}

export function checkAlarms() {
    if (alarms.length === 0) return;

    const currentTime = moment().format('HH:mm');

    alarms.forEach((alarm, index) => {
        if (alarm.time === currentTime && !alarm.triggered) {
            alarms[index].triggered = true;
            document.body.classList.add('alarming');
            playAlarm();
        }
    });
}

export function addAlarm(time) {
    if (alarms.length === 0) {
        const randomImage = alarmImages[Math.floor(Math.random() * alarmImages.length)];
        alarms.push({ time: time, triggered: false, imageUrl: randomImage });
        updateAlarmList();
    }
}

export function removeAlarm(index) {
    if (index >= 0 && index < alarms.length) {
        if (alarms[index].triggered && document.body.classList.contains('alarming')) {
            stopAlarmSound();
            document.body.classList.remove('alarming');
        }
        alarms.splice(index, 1);
        updateAlarmList();
    }
}

export function updateAlarmList() {
    const list = document.getElementById('alarmList');
    const controls = document.querySelector('.alarm-controls');

    if (alarms.length > 0) {
        controls.style.display = 'none';
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

export function updateTimeDisplay() {
    const h = pad(currentSelectedHour);
    const m = pad(currentSelectedMinute);
    document.getElementById('hourInput').value = h;
    document.getElementById('minuteInput').value = m;
    document.getElementById('selectedTime').textContent = h + ':' + m;
}

export function incrementHour() {
    currentSelectedHour = (currentSelectedHour + 1) % 24;
    updateTimeDisplay();
}

export function decrementHour() {
    currentSelectedHour = (currentSelectedHour - 1 + 24) % 24;
    updateTimeDisplay();
}

export function incrementMinute() {
    currentSelectedMinute = (currentSelectedMinute + 1) % 60;
    updateTimeDisplay();
}

export function decrementMinute() {
    currentSelectedMinute = (currentSelectedMinute - 1 + 60) % 60;
    updateTimeDisplay();
}
