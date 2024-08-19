document.addEventListener('DOMContentLoaded', () => {
    let debounceTimer;

    function debounce(func, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay);
    }

    function displayError(message) {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = `<div class="error">${message}</div>`;
    }

    function showLoading() {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '<div class="loading">Loading weather data...</div>';
    }

    function formatTemperature(temp) {
        return `${Math.round(temp)}°C`;
    }

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
                    displayError('Unable to retrieve location. Defaulting to Jerusalem.');
                    fetchWeatherData('Jerusalem');
                }
            );
        } else {
            console.error('Geolocation is not supported.');
            displayError('Geolocation is not supported by your browser.');
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
                displayError('Unable to fetch city data. Defaulting to Jerusalem.');
                fetchWeatherData('Jerusalem');
            });
    }

    function getWeatherByCity() {
        const cityInput = document.getElementById('cityInput').value;
        if (cityInput.trim() !== '') {
            showLoading();
            fetchWeatherData(cityInput);
        } else {
            console.error('Please enter a city name.');
            displayError('Please enter a valid city name.');
        }
    }

    function fetchWeatherData(city) {
        const apiKey = '2480e87306578aee0e2b4063641d2414';
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        showLoading();

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                clearWeatherInfo();
                displayWeatherData(data, city);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                displayError('Failed to fetch weather data. Please try again.');
            });
    }

    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');

        // Display current weather information
        const currentWeatherContainer = document.createElement('div');
        currentWeatherContainer.classList.add('current-weather', 'fade-in');
        currentWeatherContainer.innerHTML = `
            <h2>Current Weather in ${city}</h2>
            <p>Temperature: ${formatTemperature(data.list[0].main.temp)}</p>
            <p>Description: ${data.list[0].weather[0].description}</p>
            <img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
        `;
        weatherInfo.appendChild(currentWeatherContainer);

        // Create a container div for the 5-day forecast
        const weeklyForecastContainer = document.createElement('div');
        weeklyForecastContainer.classList.add('next-5-days', 'fade-in');
        weeklyForecastContainer.innerHTML = `
            <div class="daily-forecast"></div>
        `;
        weatherInfo.appendChild(weeklyForecastContainer);

        // Create an object to store daily data
        const dailyData = {};

        // Process each forecast entry starting from the second entry
        for (let i = 2; i < data.list.length; i++) {
            const entry = data.list[i];
            const day = formatDate(entry.dt);

            // Check if the day is already processed
            if (!dailyData[day]) {
                const dayTemperature = formatTemperature(entry.main.temp);
                const dayWeather = {
                    'day': day,
                    'temperature': dayTemperature,
                    'description': entry.weather[0].description,
                    'icon': entry.weather[0].icon
                };

                const dayElement = document.createElement('div');
                dayElement.classList.add('day');
                dayElement.innerHTML = `
                    <p class="date">${dayWeather.day}</p>
                    <img src="http://openweathermap.org/img/wn/${dayWeather.icon}.png" alt="Weather Icon" class="weather-icon">
                    <p class="temperature">${dayWeather.temperature}</p>
                    <p class="description">${dayWeather.description}</p>
                `;

                weeklyForecastContainer.querySelector('.daily-forecast').appendChild(dayElement);

                // Store the processed day to avoid duplicates
                dailyData[day] = true;
            }
        }
    }

    // Function to clear existing content in the weather-info div
    function clearWeatherInfo() {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '';
    }

    // Helper function to format UNIX timestamp to a readable date
    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Event listeners for buttons
    document.getElementById('getLocationBtn').addEventListener('click', getUserLocation);
    document.getElementById('getWeatherByCityBtn').addEventListener('click', getWeatherByCity);

    document.getElementById('cityInput').addEventListener('input', (e) => {
        debounce(() => {
            if (e.target.value.trim() !== '') {
                getWeatherByCity();
            }
        }, 500);
    });
});
