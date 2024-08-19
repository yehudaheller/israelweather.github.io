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

    // Mapping between Hebrew and English city names
      const cityMap = {
        'תל אביב': 'Tel Aviv',
        'ירושלים': 'Jerusalem',
        'חיפה': 'Haifa',
        'אילת': 'Eilat',
        'חולון': 'Holon',
        'באר שבע': 'beer sheva'
    };

    // Use the English name from the mapping if the input city is in Hebrew
    const normalizedCity = cityMapping[city] || city;

    try {
        // Attempt to get data from the local JSON file
        const response = await fetch('weather_data.json');
        const data = await response.json();
        const cityData = data.cities.find(c => c.city.toLowerCase() === normalizedCity.toLowerCase());

        if (cityData) {
            console.log(`Data for ${normalizedCity} was retrieved from the local JSON file.`);
            clearWeatherInfo();
            displayWeatherData(cityData, city);  // Pass the original city name for display
            return;
        }
    } catch (error) {
        console.error("Error fetching local data:", error);
    }

    // If not found in the local JSON, perform a direct API call
    const apiKey = '2480e87306578aee0e2b4063641d2414';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${normalizedCity}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(`Data for ${normalizedCity} was retrieved from the OpenWeatherMap API.`);
        clearWeatherInfo();
        displayWeatherData(data, city);  // Pass the original city name for display
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayError('לא ניתן לקבל את נתוני מזג האוויר. אנא נסה שוב.');
    }
};


    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');

        // Display current weather information
        const currentWeatherContainer = document.createElement('article');
        currentWeatherContainer.classList.add('current-weather', 'fade-in');
        currentWeatherContainer.innerHTML = `
            <h2>מזג האוויר הנוכחי ב${city}</h2>
            <p>טמפרטורה: <span itemprop="temperature">${formatTemperature(data.list[0].main.temp)}</span></p>
            <p>תיאור: <span itemprop="description">${translateWeatherDescription(data.list[0].weather[0].description)}</span></p>
            <img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png" alt="סמל מזג אוויר" class="weather-icon">
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

        // Group forecast data by day
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

    function clearWeatherInfo() {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '';
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('he-IL', options);
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
