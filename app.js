document.addEventListener('DOMContentLoaded', () => {
    // Check if geolocation is supported by the browser
    if (navigator.geolocation) {
        // Get the user's current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Extract latitude and longitude from the position object
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                
                // Use the latitude and longitude to fetch the city name
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                        // Now you have the city name, use it to fetch weather information
                        fetchWeatherData(city);
                    })
                    .catch(error => console.error('Error fetching city data:', error));
            },
            (error) => {
                console.error('Error getting user location:', error);
                // If there's an error with geolocation, default to a specific city
                fetchWeatherData('Jerusalem');
            }
        );
    } else {
        // If geolocation is not supported, default to a specific city
        console.log("Geolocation is not supported");
        fetchWeatherData('Jerusalem');
    }

    function fetchWeatherData(city) {
        const apiKey = '2480e87306578aee0e2b4063641d2414';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const weatherInfo = document.getElementById('weather-info');
                const temperature = data.main.temp;
                const description = data.weather[0].description;

                weatherInfo.innerHTML = `<p>Temperature: ${temperature} &#8451;</p><p>Description: ${description}</p>`;
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }
});
