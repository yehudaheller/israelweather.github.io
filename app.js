document.addEventListener('DOMContentLoaded', () => {
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    console.log("Latitude:", latitude);
                    console.log("Longitude:", longitude);

                    // Fetch weather data based on user's location
                    fetchWeatherDataByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    // If there's an error with geolocation, default to a specific city
                    fetchWeatherData('Jerusalem');
                }
            );
        } else {
            console.error('Geolocation is not supported.');
        }
    }

    function getWeatherByCity() {
        const cityInput = document.getElementById('cityInput').value;
        if (cityInput.trim() !== '') {
            // Fetch weather data based on user-entered city name
            fetchWeatherData(cityInput);
        } else {
            console.error('Please enter a city name.');
        }
    }

    function fetchWeatherDataByCoords(latitude, longitude) {
        const apiKey = '2480e87306578aee0e2b4063641d2414';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function fetchWeatherData(city) {
        const apiKey = '2480e87306578aee0e2b4063641d2414';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function displayWeatherData(data) {
        const weatherInfo = document.getElementById('weather-info');
        const temperature = data.main.temp;
        const description = data.weather[0].description;

        weatherInfo.innerHTML = `<p>Temperature: ${temperature} &#8451;</p><p>Description: ${description}</p>`;
    }

    // Event listeners for buttons
    document.getElementById('getLocationBtn').addEventListener('click', getUserLocation);
    document.getElementById('getWeatherByCityBtn').addEventListener('click', getWeatherByCity);
});
