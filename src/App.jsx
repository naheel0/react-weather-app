import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    
    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      
      try {
        const res = await axios.get(`https://wttr.in/${city}?format=j1`);
        console.log(res.data);
        setWeather(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-400 to-blue-600 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">Weather App</h1>
          <p className="text-blue-100 text-center mt-2">Get real-time weather information</p>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-4 pl-12 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Weather Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {weather && !loading && (
            <div className="space-y-6">
              {/* Current Weather */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </h2>
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900">
                    {weather.current_condition[0].temp_C}°C
                  </div>
                  <div className="text-lg text-gray-600">
                    {weather.current_condition[0].weatherDesc[0].value}
                  </div>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Feels Like</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weather.current_condition[0].FeelsLikeC}°C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weather.current_condition[0].humidity}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Wind</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weather.current_condition[0].windspeedKmph} km/h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Pressure</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {weather.current_condition[0].pressure} mb
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-500">
                <p>Visibility: {weather.current_condition[0].visibility} km</p>
              </div>
            </div>
          )}

          {!weather && !loading && !error && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="text-gray-500 mt-4">Enter a city name to see the weather</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}