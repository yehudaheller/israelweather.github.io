import os
import json
import requests
from datetime import datetime

API_KEY = os.environ['OPENWEATHERMAP_API_KEY']
CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Holon', 'beer sheva']

def get_weather(city):
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
    
    current_response = requests.get(current_url)
    forecast_response = requests.get(forecast_url)
    
    current_data = current_response.json()
    forecast_data = forecast_response.json()
    
    # Process 5-day forecast
    daily_forecasts = {}
    for item in forecast_data['list']:
        date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
        if date not in daily_forecasts:
            daily_forecasts[date] = {
                'temp': item['main']['temp'],
                'description': item['weather'][0]['description'],
                'icon': item['weather'][0]['icon']
            }
    
    # Keep only 5 days
    daily_forecasts = dict(list(daily_forecasts.items())[:5])
    
    return {
        'city': city,
        'current': {
            'temperature': current_data['main']['temp'],
            'description': current_data['weather'][0]['description'],
            'icon': current_data['weather'][0]['icon']
        },
        'forecast': daily_forecasts
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
