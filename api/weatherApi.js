/**
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 */

const API_URL = "https://api.open-meteo.com/v1/forecast";

const PARAMS = {
  hourly: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation_probability",
    "cloud_cover",
    "wind_speed_10m",
    "wind_direction_10m",
    "weather_code",
  ],
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "rain_sum",
  ],
  current: [
    "temperature_2m",
    "apparent_temperature",
    "weather_code",
    "relative_humidity_2m",
    "wind_speed_10m",
  ],
  forecast_days: 7,
  timeformat: "unixtime", // This makes parsing MUCH easier
};

/* ------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------ */

export async function getWeather({ latitude, longitude }) {
  const url = new URL(API_URL);
  
  // Setup Parameters
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", PARAMS.current.join(","));
  url.searchParams.set("hourly", PARAMS.hourly.join(","));
  url.searchParams.set("daily", PARAMS.daily.join(","));
  url.searchParams.set("forecast_days", PARAMS.forecast_days);
  url.searchParams.set("timeformat", PARAMS.timeformat);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather data fetch failed");
  
  const data = await res.json();

  return {
    current: {
      time: new Date(data.current.time * 1000),
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
    },
    hourly: {
      time: data.hourly.time.map(t => new Date(t * 1000)),
      temperature: data.hourly.temperature_2m,
      humidity: data.hourly.relative_humidity_2m,
      feelsLike: data.hourly.apparent_temperature,
      precipitationChance: data.hourly.precipitation_probability,
      cloudCover: data.hourly.cloud_cover,
      windSpeed: data.hourly.wind_speed_10m,
      windDirection: data.hourly.wind_direction_10m,
      weatherCode: data.hourly.weather_code,
    },
    daily: {
      time: data.daily.time.map(t => new Date(t * 1000)),
      weatherCode: data.daily.weather_code,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      sunrise: data.daily.sunrise.map(t => new Date(t * 1000)),
      sunset: data.daily.sunset.map(t => new Date(t * 1000)),
      uvIndexMax: data.daily.uv_index_max,
      rainTotal: data.daily.rain_sum,
    }
  };
}