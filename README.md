# Israel Weather App

This project is a weather application for Israel, providing current weather conditions and a 5-day forecast for various cities across the country.

## Live View

You can see the live version of the application here:
[Israel Weather App](https://yehudaheller.github.io/israelweather/)

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)

- **Backend:**
  - Python 3.x

- **APIs:**
  - OpenWeatherMap API for weather data
  - Nominatim API for reverse geocoding

- **Data Storage:**
  - JSON for local data storage

- **Version Control:**
  - Git

- **Automation:**
  - GitHub Actions for CI/CD

- **Hosting:**
  - GitHub Pages

## Features

- Current weather display
- 5-day weather forecast
- Geolocation support
- City search functionality
- Dark mode toggle
- Responsive design
- Automatic daily weather data updates

## API Usage Optimization

Due to the limitation of 1000 API requests per day from OpenWeatherMap, this project implements a strategy to reduce API calls:

- Weather data for popular cities is pre-fetched (once a day) and stored in a local JSON file (`weather_data.json`).
- The application first attempts to retrieve data from this JSON file for requested cities.
- If the city is not found in the local data, only then does it make an API call to OpenWeatherMap.

This approach significantly reduces the number of API calls, ensuring the application remains functional even with high user traffic.

## Project Structure

- `index.html`: Main HTML file
- `style.css`: CSS styles
- `app.js`: Main JavaScript file for frontend functionality
- `update_weather.py`: Python script for fetching and updating weather data
- `weather_data.json`: Local storage for weather data of popular cities
- `.github/workflows/update_weather.yml`: GitHub Actions workflow for automated updates

## Setup and Running

1. Clone the repository
2. Open `index.html` in a web browser to view the application
3. To update weather data manually, run `python update_weather.py` (requires Python and necessary dependencies)

## Automated Updates

The project uses GitHub Actions to automatically update weather data daily. The workflow is defined in `.github/workflows/update_weather.yml`.

## API Keys

This project requires an API key from OpenWeatherMap. The key should be stored as a secret in your GitHub repository settings.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page](link-to-your-issues-page) if you want to contribute.

## License

[MIT](https://choosealicense.com/licenses/mit/)
