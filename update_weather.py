import os
import json
import requests
from datetime import datetime

API_KEY = os.environ['OPENWEATHERMAP_API_KEY']
CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Holon', 'beer sheva']  # List of cities to update

def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        
        # Extract only the relevant forecast data
        forecast = []
        for entry in data['list']:
            forecast.append({
                'dt': entry['dt'],
                'main': {
                    'temp': entry['main']['temp'],
                    'pressure': entry['main']['pressure'],
                    'humidity': entry['main']['humidity']
                },
                'weather': entry['weather'],
                'dt_txt': entry['dt_txt']
            })
        
        return {
            'city': city,
            'forecast': forecast  # Full forecast data
        }
    else:
        print(f"Failed to get weather data for {city}. Status code: {response.status_code}")
        return None

def update_weather_data():
    weather_data = []
    for city in CITIES:
        city_weather = get_weather(city)
        if city_weather:
            weather_data.append(city_weather)
    
    with open('weather_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'last_updated': datetime.now().isoformat(),
            'cities': weather_data
        }, f, ensure_ascii=False, indent=4)  # Use ensure_ascii=False to handle non-ASCII characters

if __name__ == "__main__":
    update_weather_data()
