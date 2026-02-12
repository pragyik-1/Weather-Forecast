// app/ui.js
import {
  formatDate,
  formatTime,
  getWeatherDescription,
  getWeatherIcon,
  formatTemperature,
} from "../api/util.js";

export class WeatherUI {
  constructor(DOM) {
    this.DOM = DOM;
  }

  showLoading() {
    this.DOM.loading.classList.remove("hidden");
    this.DOM.currentWeatherSection.classList.add("hidden");
    this.DOM.hourlyForecastSection.classList.add("hidden");
    this.DOM.dailyForecastSection.classList.add("hidden");
    this.hideError();
  }

  hideLoading() {
    this.DOM.loading.classList.add("hidden");
    this.DOM.currentWeatherSection.classList.remove("hidden");
    this.DOM.hourlyForecastSection.classList.remove("hidden");
    this.DOM.dailyForecastSection.classList.remove("hidden");
  }

  showError(message) {
    this.DOM.errorMessage.textContent = message;
    this.DOM.error.classList.remove("hidden");
  }

  hideError() {
    this.DOM.error.classList.add("hidden");
  }

  updateCurrentWeather(location, data) {
    if (!location || !data) return;

    const { current, daily } = data;
    const weatherDesc = getWeatherDescription(current.weatherCode);

    this.DOM.locationName.textContent = location.name ?? "--";
    this.DOM.locationCountry.textContent = `${location.country ?? "--"} • ${location.timezone ?? "--"}`;
    this.DOM.currentDate.textContent = formatDate(current.time);

    Object.assign(this.DOM.currentWeatherIcon, {
      src: getWeatherIcon(
        current.weatherCode,
        current.time,
        // if sunrise/sunset exist, pass them; otherwise undefined
        daily?.sunrise?.[0],
        daily?.sunset?.[0],
      ),
      alt: weatherDesc,
    });

    this.DOM.currentTemp.textContent = Math.round(current.temperature);
    this.DOM.currentCondition.textContent = weatherDesc;
    this.DOM.feelsLike.textContent = formatTemperature(current.feelsLike);
    this.DOM.humidity.textContent = `${Math.round(current.humidity)}%`;
    this.DOM.windSpeed.textContent = `${Math.round(current.windSpeed)} km/h`;
  }

  updateHourlyForecast({ hourly } = {}) {
    if (!hourly) return;
    const now = new Date();

    const startIdx = Math.max(
      0,
      hourly.time.findIndex((t) => new Date(t) >= now),
    );

    this.DOM.hourlyCards.replaceChildren(); // clear existing

    hourly.time.slice(startIdx, startIdx + 12).forEach((time, i) => {
      const idx = startIdx + i;
      const date = new Date(time);

      const content = `
        <div class="hourly-time">${formatTime(date)}</div>
        <img src="${getWeatherIcon(hourly.weatherCode[idx], date)}" alt="Weather" class="hourly-icon">
        <div class="hourly-temp">${formatTemperature(hourly.temperature[idx])}</div>
        <div class="hourly-humidity"><i class="fa-solid fa-water"></i> ${Math.round(hourly.humidity[idx])}%</div>
        <div class="hourly-wind"><i class="fa-solid fa-wind"></i> ${Math.round(hourly.windSpeed[idx])} km/h</div>
      `;

      this.DOM.hourlyCards.appendChild(this.createCard("hourly-card", content));
    });
  }

  updateDailyForecast({ daily } = {}) {
    if (!daily) return;
    this.DOM.dailyCards.replaceChildren();

    daily.time.slice(0, 7).forEach((time, i) => {
      const date = new Date(time);
      const weatherCode = daily.weatherCode[i];

      const content = `
        <div class="daily-date">${formatDate(date, { weekday: "short" })}</div>
        <div class="daily-full-date">${formatDate(date, { month: "short", day: "numeric" })}</div>
        <img src="${getWeatherIcon(weatherCode, date)}" alt="Weather" class="daily-icon">
        <div class="daily-condition">${getWeatherDescription(weatherCode)}</div>
        <div class="daily-temp-range">
          <span class="temp-max">${Math.round(daily.tempMax[i])}°</span> /
          <span class="temp-min">${Math.round(daily.tempMin[i])}°</span>
        </div>
        <div class="daily-details">
          <div class="daily-rain"><i class="fa-solid fa-cloud-rain"></i> ${daily.rainTotal?.[i]?.toFixed(1) ?? 0}mm</div>
          <div class="daily-uv"><i class="fa-solid fa-sun"></i> ${Math.round(daily.uvIndexMax?.[i] ?? 0)}</div>
        </div>
      `;

      this.DOM.dailyCards.appendChild(this.createCard("daily-card", content));
    });
  }

  createCard(className, htmlContent) {
    const card = document.createElement("div");
    card.className = className;
    card.innerHTML = htmlContent;
    return card;
  }
}
