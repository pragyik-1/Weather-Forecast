// main.js
import { WeatherApp } from "./app/app.js";
import { WeatherUI } from "./app/ui.js";
import { searchLocations, reverseGeocode } from "./api/geocodeApi.js"; // adjust path as needed

// DOM mapping (manual, same as your original)
const DOM = {
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  currentLocationBtn: document.getElementById("currentLocationBtn"),
  searchResults: document.getElementById("searchResults"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  errorMessage: document.getElementById("errorMessage"),

  currentWeatherSection: document.getElementById("currentWeather"),
  hourlyForecastSection: document.getElementById("hourlyForecast"),
  dailyForecastSection: document.getElementById("dailyForecast"),

  locationName: document.getElementById("locationName"),
  locationCountry: document.getElementById("locationCountry"),
  currentDate: document.getElementById("currentDate"),
  currentWeatherIcon: document.getElementById("currentWeatherIcon"),
  currentTemp: document.getElementById("currentTemp"),
  currentCondition: document.getElementById("currentCondition"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),

  hourlyCards: document.getElementById("hourlyCards"),
  dailyCards: document.getElementById("dailyCards"),
};

const DEFAULT_LOCATION = {
  name: "Kathmandu",
  latitude: 27.70076,
  longitude: 85.30014,
  country: "Nepal",
  timezone: "Asia/Kathmandu",
};

const app = new WeatherApp(DEFAULT_LOCATION);
const ui = new WeatherUI(DOM);

// debounce implementation
function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Geolocation helper
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

async function init() {
  setupEventListeners();

  try {
    const position = await getCurrentPosition();
    await app.setCurrentLocationByCoords(position.coords.latitude, position.coords.longitude);
  } catch (err) {
    console.warn("Geolocation failed, using default:", err.message);
    app.currentLocation = DEFAULT_LOCATION;
  }

  await loadAndRenderWeather();
}

async function loadAndRenderWeather() {
  try {
    ui.showLoading();
    const weatherData = await app.loadWeather(app.currentLocation);
    ui.updateCurrentWeather(app.currentLocation, weatherData);
    ui.updateHourlyForecast(weatherData);
    ui.updateDailyForecast(weatherData);
    ui.hideLoading();
  } catch (err) {
    console.error(err);
    ui.showError("Failed to load weather data.");
  }
}

// Search flows
async function triggerSearch(query) {
  if (!query || !query.trim()) return;
  ui.showLoading();

  try {
    const results = await app.searchCity(query);
    if (results.length === 0) {
      ui.showError("No locations found.");
      return;
    }

    // Choose first result (same as original behavior)
    app.currentLocation = results[0];
    await loadAndRenderWeather();
  } catch (err) {
    console.error(err);
    ui.showError(err.message || "Search failed");
  }
}

async function searchCities(query) {
  try {
    const locations = await searchLocations(query, 5);
    displaySearchResults(locations);
  } catch (err) {
    console.error("Search error:", err);
  }
}

function displaySearchResults(locations) {
  if (!locations || locations.length === 0) return hideSearchResults();

  DOM.searchResults.innerHTML = locations
    .map((loc) => {
      // JSON in data attribute — safe-ish for local use (careful if user generated)
      return `
      <div class="result-item" data-location='${JSON.stringify(loc)}'>
        <div class="result-name">${loc.name}</div>
        <div class="result-country">${loc.country ?? ""} (${loc.timezone ?? ""})</div>
      </div>`;
    })
    .join("");

  DOM.searchResults.classList.add("show");
}

function hideSearchResults() {
  DOM.searchResults.classList.remove("show");
}

async function selectLocation(location) {
  if (!location) return;
  DOM.searchInput.value = "";
  hideSearchResults();
  app.currentLocation = location;
  await loadAndRenderWeather();
}

async function getAndUseCurrentLocation() {
  try {
    ui.showLoading();
    const position = await getCurrentPosition();
    const location = await reverseGeocode(position.coords.latitude, position.coords.longitude);
    if (location) await selectLocation(location);
    else throw new Error("No location found for coordinates");
  } catch (err) {
    console.error(err);
    ui.showError("Unable to get your location. Please search manually.");
  }
}

function setupEventListeners() {
  const { searchBtn, searchInput, currentLocationBtn, searchResults } = DOM;
  const handleSearch = () => triggerSearch(searchInput.value);

  searchBtn?.addEventListener("click", handleSearch);

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  searchInput?.addEventListener(
    "input",
    debounce(() => {
      const query = searchInput.value.trim();
      query.length >= 3 ? searchCities(query) : hideSearchResults();
    }, 400),
  );

  currentLocationBtn?.addEventListener("click", getAndUseCurrentLocation);

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    const isSearchClick = searchResults.contains(target) || target === searchInput;
    if (!isSearchClick) hideSearchResults();
  });

  // Click on search result
  searchResults?.addEventListener("click", (e) => {
    const item = e.target.closest(".result-item");
    if (item && item.dataset.location) {
      try {
        const loc = JSON.parse(item.dataset.location);
        selectLocation(loc);
      } catch (err) {
        console.error("Invalid location data in search result", err);
      }
    }
  });
}

// start
document.addEventListener("DOMContentLoaded", init);
