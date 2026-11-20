"""
Weather Service with OpenWeatherMap API Integration & Demo Fallback
"""
import os
import requests

def get_weather_data(location="Bengaluru"):
    api_key = os.getenv("WEATHER_API_KEY")

    if api_key and api_key != "your_weather_api_key_here":
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return {
                    "city": data.get("name", location),
                    "temp": round(data["main"]["temp"]),
                    "condition": data["weather"][0]["description"].title(),
                    "humidity": data["main"]["humidity"],
                    "windSpeed": round(data["wind"]["speed"] * 3.6, 1),
                    "rainProbability": 20 if "rain" not in data else 80,
                    "uvIndex": 6,
                    "sunrise": "06:12 AM",
                    "sunset": "06:45 PM",
                    "forecast": get_demo_forecast(),
                    "farmerAdvice": get_farmer_weather_advice(data["main"]["temp"], data["main"]["humidity"], 20)
                }
        except Exception:
            pass

    # Demo weather fallback
    return {
        "city": location,
        "temp": 28,
        "condition": "Partly Cloudy / à²­à²¾à²—à²¶à²ƒ à²®à³‹à²¡",
        "humidity": 68,
        "windSpeed": 14.5,
        "rainProbability": 35,
        "uvIndex": 7,
        "sunrise": "06:08 AM",
        "sunset": "06:42 PM",
        "forecast": get_demo_forecast(),
        "farmerAdvice": [
            "Rain expected tomorrow evening â€” consider delaying scheduled canal irrigation.",
            "Moderate relative humidity (68%) â€” monitor paddy fields for blast fungus.",
            "Favorable daytime temperatures (28Â°C) ideal for foliar fertilizer application."
        ]
    }

def get_demo_forecast():
    return [
        {"day": "Today", "tempMax": 29, "tempMin": 20, "condition": "Partly Cloudy", "rainProb": 35, "icon": "cloud-sun"},
        {"day": "Tomorrow", "tempMax": 27, "tempMin": 19, "condition": "Light Rain expected", "rainProb": 75, "icon": "cloud-rain"},
        {"day": "Day 3", "tempMax": 26, "tempMin": 18, "condition": "Moderate Rain", "rainProb": 80, "icon": "cloud-lightning"},
        {"day": "Day 4", "tempMax": 30, "tempMin": 21, "condition": "Sunny / Clear Sky", "rainProb": 10, "icon": "sun"},
        {"day": "Day 5", "tempMax": 31, "tempMin": 22, "condition": "Clear Sky", "rainProb": 5, "icon": "sun"},
        {"day": "Day 6", "tempMax": 29, "tempMin": 20, "condition": "Partly Cloudy", "rainProb": 20, "icon": "cloud-sun"},
        {"day": "Day 7", "tempMax": 28, "tempMin": 19, "condition": "Windy / Overcast", "rainProb": 40, "icon": "wind"}
    ]

def get_farmer_weather_advice(temp, humidity, rain_prob):
    advice = []
    if rain_prob > 50:
        advice.append("High probability of rainfall in next 24 hours â€” hold chemical spray applications.")
    else:
        advice.append("Low rainfall expected â€” maintain standard irrigation cycle.")

    if temp > 32:
        advice.append("High temperature alert â€” irrigate during early morning or late evening to reduce evaporation loss.")

    if humidity > 75:
        advice.append("High humidity increases fungal disease risk. Inspect lower leaf canopy.")

    return advice
