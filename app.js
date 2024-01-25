document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '2480e87306578aee0e2b4063641d2414';
    const city = 'Jerusalem';
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
});
