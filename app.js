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
        const apiKey = '2480e87306578aee0e2b4063641d2414';
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                clearWeatherInfo(); // Clear existing content
                displayWeatherData(data, city);
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');

        // Display current weather information (similar to your existing code)
        // ...

        const dailyForecast = data.list;

        // Create a container div for the 5-day forecast
        const weeklyForecastContainer = document.createElement('div');
        weeklyForecastContainer.classList.add('next-5-days', 'fade-in');
        weeklyForecastContainer.innerHTML = `
            
            <div class="daily-forecast"></div>
        `;

        // Append the container div to weatherInfo
        weatherInfo.appendChild(weeklyForecastContainer);

        // Create an object to store daily data
        const dailyData = {};

        // Process each forecast entry
        dailyForecast.forEach(entry => {
            const day = formatDate(entry.dt);

            // Check if the day is already processed
            if (!dailyData[day]) {
                const dayTemperature = entry.main.temp;
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
                    <p class="temperature">${dayWeather.temperature} &#8451;</p>
                    <p class="description">${dayWeather.description}</p>
                `;

                weeklyForecastContainer.querySelector('.daily-forecast').appendChild(dayElement);

                // Store the processed day to avoid duplicates
                dailyData[day] = true;
            }
        });
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
});
