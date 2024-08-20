const cityMap = {
    'תל אביב': 'Tel Aviv',
    'ירושלים': 'Jerusalem',
    'חיפה': 'Haifa',
    'אילת': 'Eilat',
    'באר שבע': 'Beer Sheva',
    'נתניה': 'Netanya',
    'אשדוד': 'Ashdod',
    'ראשון לציון': 'Rishon LeZion',
    'פתח תקווה': 'Petah Tikva',
    'חולון': 'Holon',
    'רחובות': 'Rehovot',
    'הרצליה': 'Herzliya',
    'כפר סבא': 'Kfar Saba',
    'רעננה': 'Ra\'anana',
    'בת ים': 'Bat Yam',
    'אשקלון': 'Ashkelon',
    'טבריה': 'Tiberias',
    'נצרת': 'Nazareth',
    'עכו': 'Acre',
    'נהריה': 'Nahariya',
    'לוד': 'Lod',
    'מודיעין': 'Modiin',
    'רמת גן': 'Ramat Gan',
    'גבעתיים': 'Givatayim',
    'רמלה': 'Ramla',
    'עפולה': 'Afula',
    'דימונה': 'Dimona',
    'קרית גת': 'Kiryat Gat',
    'קרית שמונה': 'Kiryat Shmona',
    'שדרות': 'Sderot',
    'ערד': 'Arad',
    'צפת': 'Safed',
    'יבנה': 'Yavne',
    'בית שמש': 'Beit Shemesh'
};

// יצירת אובייקט גלובלי לאפליקציה

const weatherApp = {};

document.addEventListener('DOMContentLoaded', () => {


    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', null);
        }
    });

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

    const cityEnglish = cityMap[city] || city;

    try {
        // Try to get data from the local JSON file
        const response = await fetch('weather_data.json');
        const data = await response.json();
        const cityData = data.cities.find(c => c.city.toLowerCase() === cityEnglish.toLowerCase());

        if (cityData) {
            clearWeatherInfo();
            console.log(`Data for ${city} was retrieved from the local JSON file.`);
            displayWeatherData(cityData, city);
            return;
        }
    } catch (error) {
        console.error("Error fetching local data:", error);
    }

        // If not found in the local JSON, make a direct API call
        const apiKey = '2480e87306578aee0e2b4063641d2414'
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

    function displayWeatherData(data, city) {
        const weatherInfo = document.getElementById('weather-info');
        let currentWeather, forecast;

        if (data.list) {
            // Data from API
            currentWeather = {
                temperature: data.list[0].main.temp,
                description: data.list[0].weather[0].description,
                icon: data.list[0].weather[0].icon
            };
            forecast = processApiForecast(data.list);
        } else {
            // Data from local JSON
            currentWeather = data.current;
            forecast = data.forecast;
        }

        // Display current weather information
        const currentWeatherContainer = document.createElement('article');
        currentWeatherContainer.classList.add('current-weather', 'fade-in');
        currentWeatherContainer.innerHTML = `
            <h2>מזג האוויר הנוכחי ב${city}</h2>
            <p>טמפרטורה: <span itemprop="temperature">${formatTemperature(currentWeather.temperature)}</span></p>
            <p>תיאור: <span itemprop="description">${translateWeatherDescription(currentWeather.description)}</span></p>
            <img src="http://openweathermap.org/img/wn/${currentWeather.icon}.png" alt="סמל מזג אוויר" class="weather-icon">
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

        // Display daily forecasts
        const dailyForecastContainer = weeklyForecastContainer.querySelector('.daily-forecast');
        Object.entries(forecast).forEach(([date, forecastData]) => {
            const dailyForecast = document.createElement('div');
            dailyForecast.classList.add('daily-forecast-item');
            dailyForecast.innerHTML = `
                <h3>${formatDate(date)}</h3>
                <img src="http://openweathermap.org/img/wn/${forecastData.icon}.png" alt="סמל מזג אוויר" class="weather-icon">
                <p>${formatTemperature(forecastData.temp)}</p>
                <p>${translateWeatherDescription(forecastData.description)}</p>
            `;
            dailyForecastContainer.appendChild(dailyForecast);
        });
    }

    function processApiForecast(list) {
        const forecast = {};
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!forecast[date]) {
                forecast[date] = {
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                };
            }
        });
        return Object.fromEntries(Object.entries(forecast).slice(0, 5));
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', { weekday: 'long' });
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
