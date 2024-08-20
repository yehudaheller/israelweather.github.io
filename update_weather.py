import os
import json
import requests
from datetime import datetime

API_KEY = os.environ['OPENWEATHERMAP_API_KEY']
CITIES = [
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Beer Sheva', 'Netanya',
    'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Holon', 'Rehovot',
    'Herzliya', 'Kfar Saba', 'Ra\'anana', 'Bat Yam', 'Ashkelon',
    'Tiberias', 'Nazareth', 'Acre', 'Nahariya', 'Lod', 'Modiin',
    'Ramat Gan', 'Givatayim', 'Ramla', 'Afula', 'Dimona', 'Kiryat Gat',
    'Kiryat Shmona', 'Sderot', 'Arad', 'Safed', 'Yavne', 'Beit Shemesh'
]

CITY_MAP = {
    'Tel Aviv': 'תל אביב',
    'Jerusalem': 'ירושלים',
    'Haifa': 'חיפה',
    'Eilat': 'אילת',
    'Beer Sheva': 'באר שבע',
    'Netanya': 'נתניה',
    'Ashdod': 'אשדוד',
    'Rishon LeZion': 'ראשון לציון',
    'Petah Tikva': 'פתח תקווה',
    'Holon': 'חולון',
    'Rehovot': 'רחובות',
    'Herzliya': 'הרצליה',
    'Kfar Saba': 'כפר סבא',
    'Ra\'anana': 'רעננה',
    'Bat Yam': 'בת ים',
    'Ashkelon': 'אשקלון',
    'Tiberias': 'טבריה',
    'Nazareth': 'נצרת',
    'Acre': 'עכו',
    'Nahariya': 'נהריה',
    'Lod': 'לוד',
    'Modiin': 'מודיעין',
    'Ramat Gan': 'רמת גן',
    'Givatayim': 'גבעתיים',
    'Ramla': 'רמלה',
    'Afula': 'עפולה',
    'Dimona': 'דימונה',
    'Kiryat Gat': 'קרית גת',
    'Kiryat Shmona': 'קרית שמונה',
    'Sderot': 'שדרות',
    'Arad': 'ערד',
    'Safed': 'צפת',
    'Yavne': 'יבנה',
    'Beit Shemesh': 'בית שמש'
}


def get_weather(city):
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city},IL&appid={API_KEY}&units=metric"
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city},IL&appid={API_KEY}&units=metric"

    current_response = requests.get(current_url)
    forecast_response = requests.get(forecast_url)

    if current_response.status_code != 200 or forecast_response.status_code != 200:
        raise Exception(f"API request failed for {city}")

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
        'city_hebrew': CITY_MAP.get(city, city),  # Add Hebrew name
        'current': {
            'temperature': current_data['main']['temp'],
            'description': current_data['weather'][0]['description'],
            'icon': current_data['weather'][0]['icon']
        },
        'forecast': daily_forecasts
    }


def update_weather_data():
    weather_data = []
    for city in CITIES:
        try:
            city_weather = get_weather(city)
            weather_data.append(city_weather)
            print(f"Successfully fetched data for {city}")
        except Exception as e:
            print(f"Error fetching data for {city}: {e}")

    with open('weather_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'last_updated': datetime.now().isoformat(),
            'cities': weather_data
        }, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    update_weather_data()
