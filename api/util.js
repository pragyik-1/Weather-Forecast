/**
 * Weather condition codes mapping to icons and descriptions
 */
export const weatherCodes = {
  0: {
    description: "Clear sky",
    icon: "clear",
    dayIcon: "clear-day",
    nightIcon: "clear-night",
  },
  1: {
    description: "Mainly clear",
    icon: "clear",
    dayIcon: "clear-day",
    nightIcon: "clear-night",
  },
  2: {
    description: "Partly cloudy",
    icon: "partly-cloudy",
    dayIcon: "partly-cloudy-day",
    nightIcon: "partly-cloudy-night",
  },
  3: {
    description: "Overcast",
    icon: "cloudy",
    dayIcon: "cloudy",
    nightIcon: "cloudy",
  },
  45: { description: "Foggy", icon: "fog", dayIcon: "fog", nightIcon: "fog" },
  48: {
    description: "Depositing rime fog",
    icon: "fog",
    dayIcon: "fog",
    nightIcon: "fog",
  },
  51: {
    description: "Light drizzle",
    icon: "drizzle",
    dayIcon: "drizzle",
    nightIcon: "drizzle",
  },
  53: {
    description: "Moderate drizzle",
    icon: "drizzle",
    dayIcon: "drizzle",
    nightIcon: "drizzle",
  },
  55: {
    description: "Dense drizzle",
    icon: "drizzle",
    dayIcon: "drizzle",
    nightIcon: "drizzle",
  },
  56: {
    description: "Light freezing drizzle",
    icon: "sleet",
    dayIcon: "sleet",
    nightIcon: "sleet",
  },
  57: {
    description: "Dense freezing drizzle",
    icon: "sleet",
    dayIcon: "sleet",
    nightIcon: "sleet",
  },
  61: {
    description: "Slight rain",
    icon: "rain",
    dayIcon: "rain",
    nightIcon: "rain",
  },
  63: {
    description: "Moderate rain",
    icon: "rain",
    dayIcon: "rain",
    nightIcon: "rain",
  },
  65: {
    description: "Heavy rain",
    icon: "heavy-rain",
    dayIcon: "heavy-rain",
    nightIcon: "heavy-rain",
  },
  66: {
    description: "Light freezing rain",
    icon: "sleet",
    dayIcon: "sleet",
    nightIcon: "sleet",
  },
  67: {
    description: "Heavy freezing rain",
    icon: "sleet",
    dayIcon: "sleet",
    nightIcon: "sleet",
  },
  71: {
    description: "Slight snowfall",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  73: {
    description: "Moderate snowfall",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  75: {
    description: "Heavy snowfall",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  77: {
    description: "Snow grains",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  80: {
    description: "Slight rain showers",
    icon: "rain",
    dayIcon: "rain",
    nightIcon: "rain",
  },
  81: {
    description: "Moderate rain showers",
    icon: "rain",
    dayIcon: "rain",
    nightIcon: "rain",
  },
  82: {
    description: "Violent rain showers",
    icon: "heavy-rain",
    dayIcon: "heavy-rain",
    nightIcon: "heavy-rain",
  },
  85: {
    description: "Slight snow showers",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  86: {
    description: "Heavy snow showers",
    icon: "snow",
    dayIcon: "snow",
    nightIcon: "snow",
  },
  95: {
    description: "Thunderstorm",
    icon: "thunderstorms",
    dayIcon: "thunderstorms-day",
    nightIcon: "thunderstorms-night",
  },
  96: {
    description: "Thunderstorm with slight hail",
    icon: "thunderstorms",
    dayIcon: "thunderstorms-day",
    nightIcon: "thunderstorms-night",
  },
  99: {
    description: "Thunderstorm with heavy hail",
    icon: "thunderstorms",
    dayIcon: "thunderstorms-day",
    nightIcon: "thunderstorms-night",
  },
};

/**
 * Get weather icon URL based on weather code and time of day
 * Using free weather icons from https://basmilius.github.io/weather-icons
 * @param {number} code - Weather code
 * @param {Date} date - Date to determine day/night
 * @param {Date} sunrise - Sunrise time
 * @param {Date} sunset - Sunset time
 * @returns {string} - Icon URL
 */
export function getWeatherIcon(
  code,
  date = new Date(),
  sunrise = null,
  sunset = null,
) {
  const baseUrl =
    "https://basmilius.github.io/weather-icons/production/fill/all";

  // Determine if it's day or night
  let isDay = true;
  if (sunrise && sunset) {
    const hour = date.getHours();
    const sunriseHour = sunrise.getHours();
    const sunsetHour = sunset.getHours();
    isDay = hour >= sunriseHour && hour < sunsetHour;
  } else {
    // Fallback: day between 6 AM and 8 PM
    const hour = date.getHours();
    isDay = hour >= 6 && hour < 20;
  }

  const weatherInfo = weatherCodes[code] || weatherCodes[0];
  const iconName = isDay ? weatherInfo.dayIcon : weatherInfo.nightIcon;

  return `${baseUrl}/${iconName}.svg`;
}

/**
 * Get weather description based on code
 * @param {number} code - Weather code
 * @returns {string} - Weather description
 */
export function getWeatherDescription(code) {
  const weatherInfo = weatherCodes[code] || weatherCodes[0];
  return weatherInfo.description;
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature
 * @param {string} unit - Temperature unit (default: °C)
 * @returns {string} - Formatted temperature
 */
export function formatTemperature(temp, unit = "°C") {
  return `${Math.round(temp)}${unit}`;
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format time to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time
 */
export function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} - Wind direction (N, NE, E, etc.)
 */
export function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
}