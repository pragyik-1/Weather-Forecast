// app/app.js
import { searchLocations, reverseGeocode } from "../api/geocodeApi.js";
import { getWeather } from "../api/weatherApi.js";

export class WeatherApp {
  constructor(defaultLocation) {
    this.currentLocation = defaultLocation;
    this.currentWeatherData = null;
  }

  async setCurrentLocationByCoords(lat, lon) {
    const location = await reverseGeocode(lat, lon);
    this.currentLocation = location ?? this.currentLocation;
    return this.currentLocation;
  }

  async searchCity(query, limit = 5) {
    if (!query) return [];
    return await searchLocations(query, limit);
  }

  async loadWeather(location) {
    if (!location) throw new Error("No location provided");
    this.currentWeatherData = await getWeather({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return this.currentWeatherData;
  }
}
