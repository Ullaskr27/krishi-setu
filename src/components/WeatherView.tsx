import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  AlertCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Language, WeatherData } from '../types';
import { translations } from '../translations';

interface WeatherViewProps {
  language: Language;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ language }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState('Mandya, Karnataka');

  const t = translations[language];

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(cityInput);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">

      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.weather}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live weather forecast & micro-climate advisory tailored for agricultural planning.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter City / District..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-800 hover:bg-emerald-900 text-white p-2 rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {weather && (
        <>
          {/* Main Weather Card & Advisory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Weather Spotlight */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-900 via-emerald-850 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                    Current Location
                  </span>
                  <h3 className="text-2xl font-bold mt-0.5">{weather.city}</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-amber-300">{weather.temp}Â°C</span>
                  <p className="text-xs text-emerald-200 font-medium">{weather.condition}</p>
                </div>
              </div>

              {/* Sub Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/80 text-xs">
                <div className="bg-emerald-800/50 p-3 rounded-2xl border border-emerald-700/60">
                  <Droplets className="w-4 h-4 text-cyan-300 mb-1" />
                  <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Humidity</span>
                  <span className="font-bold text-white text-sm">{weather.humidity}%</span>
                </div>
                <div className="bg-emerald-800/50 p-3 rounded-2xl border border-emerald-700/60">
                  <Wind className="w-4 h-4 text-sky-300 mb-1" />
                  <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Wind Speed</span>
                  <span className="font-bold text-white text-sm">{weather.windSpeed} km/h</span>
                </div>
                <div className="bg-emerald-800/50 p-3 rounded-2xl border border-emerald-700/60">
                  <CloudRain className="w-4 h-4 text-blue-300 mb-1" />
                  <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Rain Prob</span>
                  <span className="font-bold text-white text-sm">{weather.rainProbability}%</span>
                </div>
                <div className="bg-emerald-800/50 p-3 rounded-2xl border border-emerald-700/60">
                  <Sun className="w-4 h-4 text-amber-300 mb-1" />
                  <span className="text-emerald-300 text-[10px] uppercase font-semibold block">UV Index</span>
                  <span className="font-bold text-white text-sm">{weather.uvIndex} (Moderate)</span>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="mt-4 flex items-center justify-between text-xs text-emerald-200 pt-3 border-t border-emerald-800/80">
                <div className="flex items-center gap-1.5">
                  <Sunrise className="w-4 h-4 text-amber-300" />
                  <span>Sunrise: {weather.sunrise}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sunset className="w-4 h-4 text-orange-300" />
                  <span>Sunset: {weather.sunset}</span>
                </div>
              </div>
            </div>

            {/* Farmer Weather Advisory Box */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-700" />
                  {t.farmerAdviceTitle}
                </h3>

                <div className="space-y-3 text-xs">
                  {weather.farmerAdvice.map((advice, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 font-medium leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0 mt-1.5" />
                      <span>{advice}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium text-center">
                ðŸŒ¾ Weather data updated hourly for Mandya & South Karnataka APMC zones.
              </div>
            </div>

          </div>

          {/* 7-Day Weather Forecast */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80">
            <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">
              {t.forecast7Days}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200/80 text-center flex flex-col items-center justify-between gap-2 hover:bg-emerald-50/60 transition-colors"
                >
                  <span className="font-bold text-xs text-gray-800">{item.day}</span>
                  <div className="my-1 text-amber-500">
                    {item.rainProb > 50 ? (
                      <CloudRain className="w-6 h-6 text-blue-500 mx-auto" />
                    ) : (
                      <Sun className="w-6 h-6 text-amber-500 mx-auto" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-gray-900">
                    {item.tempMax}Â° <span className="text-gray-400 font-normal">{item.tempMin}Â°</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    {item.rainProb}% Rain
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
