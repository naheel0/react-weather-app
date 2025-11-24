import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const inputRef = useRef(null);

  // Get weather icon based on condition
  const getWeatherIcon = (weatherCode) => {
    const icons = {
      0: '☀️',  // Clear sky
      1: '🌤️',  // Mainly clear
      2: '⛅',  // Partly cloudy
      3: '☁️',  // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '⛈️',  // Heavy rain
      71: '❄️',  // Slight snow
      73: '❄️',  // Moderate snow
      75: '🌨️',  // Heavy snow
      80: '🌦️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '⛈️',  // Violent rain showers
      95: '⛈️',  // Thunderstorm
      96: '⛈️',  // Thunderstorm with hail
      99: '⛈️'   // Thunderstorm with heavy hail
    };
    return icons[weatherCode] || '🌈';
  };

  // Get weather description
  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Light showers",
      81: "Moderate showers",
      82: "Heavy showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Severe thunderstorm"
    };
    return descriptions[weatherCode] || "Unknown";
  };

  // Get gradient based on weather
  const getGradient = (weatherCode) => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    
    if (!isDay) {
      return 'from-indigo-900 via-purple-900 to-blue-900';
    }

    switch (true) {
      case weatherCode === 0: return 'from-blue-400 via-cyan-400 to-blue-600'; // Sunny
      case weatherCode <= 3: return 'from-gray-400 via-blue-300 to-gray-500';  // Cloudy
      case weatherCode >= 51 && weatherCode <= 67: return 'from-blue-600 via-gray-500 to-blue-800'; // Rain
      case weatherCode >= 71 && weatherCode <= 77: return 'from-gray-300 via-blue-200 to-gray-400'; // Snow
      case weatherCode >= 80 && weatherCode <= 82: return 'from-blue-700 via-gray-600 to-blue-900'; // Showers
      case weatherCode >= 95: return 'from-purple-700 via-gray-800 to-blue-900'; // Storm
      default: return 'from-blue-400 via-cyan-400 to-blue-600';
    }
  };

  const fetchWeather = async (cityName = city) => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setLocation(null);
    
    try {
      // First, get coordinates from city name
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error('City not found');
      }

      const locationData = geoResponse.data.results[0];
      setLocation({
        name: locationData.name,
        country: locationData.country,
        admin1: locationData.admin1
      });

      // Then get weather data
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const weatherData = weatherResponse.data;
      setWeather({
        current: weatherData.current,
        daily: weatherData.daily
      });

    } catch (err) {
      console.error(err);
      if (err.message === 'City not found') {
        setError("City not found. Please try another name.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to fetch weather data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const temperatureVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 8,
        delay: 0.3
      }
    }
  };

  // Background particles component
  const WeatherParticles = ({ weatherCode }) => {
    const particles = Array.from({ length: 15 });
    const isRainy = weatherCode >= 51 && weatherCode <= 82;
    const isSnowy = weatherCode >= 71 && weatherCode <= 77;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${
              isRainy ? 'w-1 h-8 bg-blue-300' : 
              isSnowy ? 'w-2 h-2 bg-white rounded-full' : 
              'w-2 h-2 bg-yellow-200 rounded-full'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: isRainy ? [0, 500] : isSnowy ? [0, 500] : [0, -100, 0],
              x: isRainy ? [0, Math.random() * 100 - 50] : isSnowy ? [0, Math.random() * 50 - 25] : [0, Math.random() * 20 - 10],
              opacity: [0, 1, 0],
              rotate: isSnowy ? [0, 360] : 0
            }}
            transition={{
              duration: isRainy ? Math.random() * 2 + 1 : isSnowy ? Math.random() * 5 + 3 : Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: isRainy ? "linear" : "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-gradient-to-br ${weather ? getGradient(weather.current.weather_code) : 'from-blue-400 to-blue-600'} transition-all duration-1000 py-8 px-4 relative overflow-hidden`}
    >
      {/* Animated Background Particles */}
      {weather && <WeatherParticles weatherCode={weather.current.weather_code} />}

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20"
      >
        {/* Header */}
        <motion.div 
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-black mb-3">Weather Magic</h1>
            <p className="text-blue-100 text-lg">Real-time weather insights</p>
          </motion.div>
        </motion.div>

        {/* Search Input */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="p-6 border-b border-gray-200/50"
        >
          <div className="relative">
            <motion.input 
              whileFocus={{ scale: 1.02 }}
              ref={inputRef}
              type="text" 
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 pl-12 pr-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 bg-gray-50 text-lg shadow-inner"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchWeather()}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Weather Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col justify-center items-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 text-lg"
                >
                  Discovering {city}...
                </motion.p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
              >
                <motion.div
                  animate={{ x: [-5, 5, -5, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl mb-4"
                >
                  ⚠️
                </motion.div>
                <p className="text-red-700 text-lg font-semibold">{error}</p>
              </motion.div>
            )}

            {weather && !loading && (
              <motion.div
                key="weather"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Current Weather */}
                <motion.div variants={itemVariants} className="text-center">
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl font-bold text-gray-800 mb-2"
                  >
                    {location?.name}
                    {location?.country && (
                      <span className="text-lg text-gray-600 block mt-1">
                        {location.country}
                        {location.admin1 && `, ${location.admin1}`}
                      </span>
                    )}
                  </motion.h2>
                  <div className="flex items-center justify-center space-x-6">
                    <motion.div 
                      variants={temperatureVariants}
                      className="text-6xl font-black text-gray-900 drop-shadow-lg"
                    >
                      {Math.round(weather.current.temperature_2m)}°C
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-5xl"
                    >
                      {getWeatherIcon(weather.current.weather_code)}
                    </motion.div>
                  </div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-xl text-gray-600 mt-2 font-medium"
                  >
                    {getWeatherDescription(weather.current.weather_code)}
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-sm text-gray-500 mt-1"
                  >
                    Feels like {Math.round(weather.current.apparent_temperature)}°C
                  </motion.div>
                </motion.div>

                {/* Weather Details */}
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-2 gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                  {[
                    { label: "Humidity", value: `${weather.current.relative_humidity_2m}%`, icon: "💧" },
                    { label: "Wind", value: `${Math.round(weather.current.wind_speed_10m)} km/h`, icon: "💨" },
                    { label: "Pressure", value: `${Math.round(weather.current.pressure_msl)} hPa`, icon: "📊" },
                    { label: "Visibility", value: `${Math.round(weather.current.visibility / 1000)} km`, icon: "👁️" }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: index * 0.1 + 0.6 }}
                      className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                      <p className="text-lg font-bold text-gray-800">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Daily Forecast */}
                {weather.daily && (
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">7-Day Forecast</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {weather.daily.time.slice(0, 7).map((date, i) => (
                        <motion.div
                          key={date}
                          whileHover={{ scale: 1.05 }}
                          className="text-center"
                        >
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            {new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                          </p>
                          <p className="text-lg mb-1">
                            {getWeatherIcon(weather.daily.weather_code[i])}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-800">
                              {Math.round(weather.daily.temperature_2m_max[i])}°
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round(weather.daily.temperature_2m_min[i])}°
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {!weather && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.svg 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-24 h-24 mx-auto text-gray-300 mb-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </motion.svg>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-500 text-lg"
                >
                  Enter a city name to explore weather
                </motion.p>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-sm mt-2"
                >
                  Try "London", "New York", "Tokyo", etc.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}