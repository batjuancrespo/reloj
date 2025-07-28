// Weather module
const weatherTranslations = {
    'clear sky': 'Despejado',
    'few clouds': 'Pocas nubes',
    'scattered clouds': 'Nubes dispersas',
    'broken clouds': 'Nuboso',
    'shower rain': 'Lluvia débil',
    'rain': 'Lluvia',
    'thunderstorm': 'Tormenta',
    'snow': 'Nieve',
    'mist': 'Niebla',
    'overcast clouds': 'Muy nuboso',
    'light rain': 'Lluvia ligera'
};

export function updateWeatherDisplay(lat, lon, apiKey) {
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=metric&cnt=32')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Current Weather
            const currentWeather = data.list[0];
            const icon = currentWeather.weather[0].icon;
            const description = weatherTranslations[currentWeather.weather[0].description.toLowerCase()] || currentWeather.weather[0].description;
            document.getElementById('current-weather').innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}"><div>${description}</div>`;
            document.getElementById('current-temp').textContent = `${Math.round(currentWeather.main.temp)}°C`;

            // Forecast for next 3 days
            let forecastHtml = '';
            const forecasts = [];
            for (let i = 1; i <= 3; i++) {
                const targetDay = moment().add(i, 'days').startOf('day');
                // Find a forecast for around noon of the target day
                const dayForecast = data.list.find(item =>
                    moment(item.dt * 1000).isSame(targetDay, 'day') && moment(item.dt * 1000).hour() >= 12
                );
                if (dayForecast) {
                    forecasts.push(dayForecast);
                }
            }

            forecasts.forEach(day => {
                const dayName = moment(day.dt * 1000).format('ddd');
                const icon = day.weather[0].icon;
                const description = weatherTranslations[day.weather[0].description.toLowerCase()] || day.weather[0].description;
                forecastHtml += `
                    <div class="weather-card">
                        <div class="day-name">${dayName}</div>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                        <div class="temp">${Math.round(day.main.temp)}°C</div>
                    </div>
                `;
            });
            document.getElementById('weather').innerHTML = forecastHtml;
        })
        .catch(error => {
            console.error('Weather Error:', error);
            document.getElementById('weather').innerHTML = '<p>Error al cargar el tiempo</p>';
        });
}

