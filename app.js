document.addEventListener('DOMContentLoaded', () => {
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    console.log("Latitude:", latitude);
                    console.log("Longitude:", longitude);

                    // Fetch city name based on user's location
                    fetchCityNameByCoords(latitude, longitude);
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

    function fetchCityNameByCoords(latitude, longitude) {
        // Use reverse geocoding to get city name from coordinates
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                // Fetch weather data based on the city name
                fetchWeatherData(city);
            })
            .catch(error => {
                console.error('Error fetching city data:', error);
                // If there's an error with reverse geocoding, default to a specific city
                fetchWeatherData('Jerusalem');
            });
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

    function fetchWeatherData(city) {
        const apiKey = '2480e87306578aee0e2b4063641d2414';
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
    
        // Display city name along with weather information and apply animation class
        weatherInfo.innerHTML = `<p class="fade-in">City: ${city}</p><p class="fade-in">Temperature: ${temperature} &#8451;</p><p class="fade-in">Description: ${description}</p>`;
    }

    // Event listeners for buttons
    document.getElementById('getLocationBtn').addEventListener('click', getUserLocation);
    document.getElementById('getWeatherByCityBtn').addEventListener('click', getWeatherByCity);
});
