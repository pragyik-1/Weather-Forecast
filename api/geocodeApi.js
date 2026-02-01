/**
 * @typedef {Object} LocationResult
 * @property {string} name
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} country
 * @property {string} timezone
 */

/**
 * Search for locations matching a query string.
 * @param {string} query - The city or place name to search for.
 * @param {number} [count=10] - Number of results to return.
 * @returns {Promise<LocationResult[]>} - A list of location results.
 */
export async function searchLocations(query, count = 10) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Location search failed");
  }

  const data = await res.json();
  if (!data.results) return [];

  // Simplify API output
  return data.results.map((loc) => ({
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    country: loc.country,
    timezone: loc.timezone,
  }));
}

function extractCity(address) {
  if (address.city) return address.city;
  if (address.town) return address.town;

  // Municipality often maps to a city in many countries
  if (address.municipality && address.municipality.length > 3) {
    return address.municipality;
  }

  // Fallbacks that are "city-like"
  if (address.county) return address.county;
  if (address.state) return address.state;

  return "Current Location";
}


export async function reverseGeocode(latitude, longitude) {
  //const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=json` +
    `&lat=${latitude}` +
    `&lon=${longitude}` +
    `&zoom=10` +
    `&addressdetails=1` +
    `&accept-language=en`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "weather-app"
    }
  });

  if (!res.ok) throw new Error("Reverse geocoding failed");

  const data = await res.json();
  const address = data.address || {};

  return {
    name: extractCity(address),
    latitude,
    longitude,
    country: address.country || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
