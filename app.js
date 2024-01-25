document.addEventListener('DOMContentLoaded', () => {
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    fetchCityNameByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    fetchWeatherData('Jerusalem');
                }
            );
        } else {
            console.error('Geolocation is not supported.');
        }
    }

    function fetchCityNameByCoords(latitude, longitude) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                fetchWeatherData(city);
            })
            .catch(error => {
                console.error('Error fetching city data:', error);
                fetchWeatherData('Jerusalem');
            });
    }

    function getWeatherByCity() {
        const cityInput = document.getElementById('cityInput').value;
        if (cityInput.trim() !== '') {
            fetchWeatherData(cityInput);
        } else {
            console.error('Please enter a city name.');
        }
    }

    function fetchWeatherData(city) {
        const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data, city);
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

        weatherInfo.innerHTML = `
            <div class="current-weather fade-in">
                <h2>Current Weather in ${city}</h2>
                <p>Temperature: ${temperature} &#8451;</p>
                <p>Description: ${description}</p>
                <img src="${iconUrl}" alt="Weather Icon" class="weather-icon">
            </div>
        `;

        const dailyForecast = data.daily.slice(1, 8);
        weatherInfo.innerHTML += `
            <div class="next-7-days fade-in">
                <h2>Next 7 Days Forecast</h2>
                <div class="daily-forecast">
                    ${dailyForecast.map(day => `
                        <div class="day">
                            <p class="date">${formatDate(day.dt)}</p>
                            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
                            <p class="temperature">${day.temp.day} &#8451;</p>
                            <p class="description">${day.weather[0].description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }

    // Event listeners for buttons
    document.getElementById('getLocationBtn').addEventListener('click', getUserLocation);
    document.getElementById('getWeatherByCityBtn').addEventListener('click', getWeatherByCity);
});
