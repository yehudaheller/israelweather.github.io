import os
import json
import requests
from datetime import datetime

API_KEY = os.environ['OPENWEATHERMAP_API_KEY']
CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat']  # רשימת ערים לעדכון

def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()
    return {
        'city': city,
        'temperature': data['main']['temp'],
        'description': data['weather'][0]['description'],
        'icon': data['weather'][0]['icon']
    }

def update_weather_data():
    weather_data = [get_weather(city) for city in CITIES]
    with open('weather_data.json', 'w') as f:
        json.dump({
            'last_updated': datetime.now().isoformat(),
            'cities': weather_data
        }, f)

if __name__ == "__main__":
    update_weather_data()