// יצירת אובייקט גלובלי לאפליקציה
const weatherApp = {};

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
        weatherInfo.innerHTML = '<div class="loading">טוען נתוני מזג אוויר...</div>';
    }

    function formatTemperature(temp) {
        return `${Math.round(temp)}°C`;
    }

    weatherApp.getUserLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    fetchCityNameByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('שגיאה בקבלת מיקום המשתמש:', error);
                    displayError('לא ניתן לקבל את המיקום שלך. ברירת מחדל לירושלים.');
                    weatherApp.fetchWeatherData('ירושלים');
                }
            );
        } else {
            console.error('גיאולוקציה אינה נתמכת.');
            displayError('גיאולוקציה אינה נתמכת בדפדפן שלך.');
        }
    }

    function fetchCityNameByCoords(latitude, longitude) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village || 'עיר לא ידועה';
                weatherApp.fetchWeatherData(city);
            })
            .catch(error => {
                console.error('שגיאה בקבלת נתוני העיר:', error);
                displayError('לא ניתן לקבל נתוני העיר. ברירת מחדל לירושלים.');
                weatherApp.fetchWeatherData('ירושלים');
            });
    }

    weatherApp.getWeatherByCity = function() {
        const cityInput = document.getElementById('cityInput').value;
        if (cityInput.trim() !== '') {
            showLoading();
            weatherApp.fetchWeatherData(cityInput);
        } else {
            console.error('אנא הזן שם עיר.');
            displayError('אנא הזן שם עיר חוקי.');
        }
    }

    weatherApp.fetchWeatherData = async function(city) {
    showLoading();

    const cityMap = {
        'תל אביב': 'Tel Aviv',
        'ירושלים': 'Jerusalem',
        'חיפה': 'Haifa',
        'אילת': 'Eilat',
        'חולון': 'Holon',
        'באר שבע': 'beer sheva'
    };

    const cityEnglish = cityMap[city] || city;

    try {
        // Try to get data from the local JSON file
        const response = await fetch('weather_data.json');
        const data = await response.json();
        const cityData = data.cities.find(c => c.city.toLowerCase() === cityEnglish.toLowerCase());

        if (cityData) {
            clearWeatherInfo();
            console.log(`Data for ${city} was retrieved from the local JSON file.`);
            displayCurrentWeather(cityData);
            displayFiveDayForecast(cityData.forecast);
            return; // Stop here if data is found in the JSON file
        }
    } catch (error) {
        console.error("Error fetching local data:", error);
    }

    // If not found in the local JSON, make a direct API call
    const apiKey = '2480e87306578aee0e2b4063641d2414';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityEnglish}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`City ${city} not found.`);
        }
        const data = await response.json();
        clearWeatherInfo();
        console.log(`Data for ${city} was retrieved from the OpenWeatherMap API.`);
        displayWeatherData(data, city);
    } catch (error) {
        console.error(`Error fetching weather data: ${error.message}`);
        displayError('לא ניתן לקבל את נתוני מזג האוויר. אנא נסה שוב.');
    }
};
    function displayCurrentWeather(cityData) {
    const weatherInfo = document.getElementById('weather-info');
    const currentForecast = cityData.forecast[0]; // Get the first forecast entry

    const temperature = currentForecast.main.temp;
    const description = currentForecast.weather[0].description;
    const icon = currentForecast.weather[0].icon;

    // Display current weather information
    const currentWeatherContainer = document.createElement('article');
    currentWeatherContainer.classList.add('current-weather', 'fade-in');
    currentWeatherContainer.innerHTML = `
        <h2>מזג האוויר הנוכחי ב${cityData.city}</h2>
        <p>טמפרטורה: <span itemprop="temperature">${formatTemperature(temperature)}</span></p>
        <p>תיאור: <span itemprop="description">${translateWeatherDescription(description)}</span></p>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="סמל מזג אוויר" class="weather-icon">
    `;
    weatherInfo.appendChild(currentWeatherContainer);
}

function displayFiveDayForecast(forecastData) {
    const weeklyForecastContainer = document.createElement('section');
    weeklyForecastContainer.classList.add('next-5-days', 'fade-in');
    weeklyForecastContainer.innerHTML = `
        <h2>תחזית ל-5 ימים הקרובים</h2>
        <div class="daily-forecast"></div>
    `;
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.appendChild(weeklyForecastContainer);

    const dailyForecastContainer = weeklyForecastContainer.querySelector('.daily-forecast');

    // Group forecast data by day
    const dailyForecasts = {};
    forecastData.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('he-IL', { weekday: 'long' });
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(forecast);
    });

    // Display daily forecasts
    Object.entries(dailyForecasts).forEach(([date, forecasts], index) => {
        if (index < 5) { // Only show the first 5 days
            const dailyForecast = document.createElement('div');
            dailyForecast.classList.add('daily-forecast-item');

            // Calculate average temperature for the day
            const avgTemp = forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length;
            const firstForecast = forecasts[0]; // Use the first forecast for the description and icon

            dailyForecast.innerHTML = `
                <h3>${date}</h3>
                <img src="http://openweathermap.org/img/wn/${firstForecast.weather[0].icon}.png" alt="סמל מזג אוויר" class="weather-icon">
                <p>${formatTemperature(avgTemp)}</p>
                <p>${translateWeatherDescription(firstForecast.weather[0].description)}</p>
            `;
            dailyForecastContainer.appendChild(dailyForecast);
        }
    });
}

    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');
        let temperature, description, icon;

        if (data.list) {
            // Data from API
            temperature = data.list[0].main.temp;
            description = data.list[0].weather[0].description;
            icon = data.list[0].weather[0].icon;
        } else if (data.temperature) {
            // Data from local JSON
            temperature = data.temperature;
            description = data.description;
            icon = data.icon;
        } else {
            console.error("Unexpected data format:", data);
            return;
        }

        // Display current weather information
        const currentWeatherContainer = document.createElement('article');
        currentWeatherContainer.classList.add('current-weather', 'fade-in');
        currentWeatherContainer.innerHTML = `
            <h2>מזג האוויר הנוכחי ב${city}</h2>
            <p>טמפרטורה: <span itemprop="temperature">${formatTemperature(temperature)}</span></p>
            <p>תיאור: <span itemprop="description">${translateWeatherDescription(description)}</span></p>
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="סמל מזג אוויר" class="weather-icon">
        `;
        weatherInfo.appendChild(currentWeatherContainer);

        // Create a container div for the 5-day forecast
        const weeklyForecastContainer = document.createElement('section');
        weeklyForecastContainer.classList.add('next-5-days', 'fade-in');
        weeklyForecastContainer.innerHTML = `
            <h2>תחזית ל-5 ימים הקרובים</h2>
            <div class="daily-forecast"></div>
        `;
        weatherInfo.appendChild(weeklyForecastContainer);

        if (data.list) {
            // Group forecast data by day (for API data)
            const dailyForecasts = {};
            data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000).toLocaleDateString('he-IL', { weekday: 'long' });
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = forecast;
                }
            });

            // Display daily forecasts
            const dailyForecastContainer = weeklyForecastContainer.querySelector('.daily-forecast');
            Object.entries(dailyForecasts).forEach(([date, forecast], index) => {
                if (index < 5) {
                    const dailyForecast = document.createElement('div');
                    dailyForecast.classList.add('daily-forecast-item');
                    dailyForecast.innerHTML = `
                        <h3>${date}</h3>
                        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="סמל מזג אוויר" class="weather-icon">
                        <p>${formatTemperature(forecast.main.temp)}</p>
                        <p>${translateWeatherDescription(forecast.weather[0].description)}</p>
                    `;
                    dailyForecastContainer.appendChild(dailyForecast);
                }
            });
        }
    }

    function clearWeatherInfo() {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '';
    }

    function translateWeatherDescription(description) {
        const translations = {
            'clear sky': 'שמיים בהירים',
            'few clouds': 'מעט עננים',
            'scattered clouds': 'עננים מפוזרים',
            'broken clouds': 'עננים שבורים',
            'shower rain': 'מקלחת גשם',
            'rain': 'גשם',
            'thunderstorm': 'סופת רעמים',
            'snow': 'שלג',
            'mist': 'ערפל'
        };
        return translations[description.toLowerCase()] || description;
    }

    // Event listeners for buttons
    document.getElementById('getLocationBtn').addEventListener('click', weatherApp.getUserLocation);
    document.getElementById('getWeatherByCityBtn').addEventListener('click', weatherApp.getWeatherByCity);

    document.getElementById('cityInput').addEventListener('input', (e) => {
        debounce(() => {
            if (e.target.value.trim() !== '') {
                weatherApp.getWeatherByCity();
            }
        }, 500);
    });
});
