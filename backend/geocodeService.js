async function geocodePlaces(items) {
  const results = [];

  for (const item of items) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(item.mapsQuery)}`;

      const response = await fetch(url, {
        headers: { "User-Agent": "HushTrail-HackathonProject/1.0" },
      });
      const data = await response.json();

      if (data && data[0]) {
        results.push({
          name: item.name,
          description: item.description,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      }
    } catch (error) {
      console.error("Geocode failed for", item.name, error);
    }

    // Be polite to the free Nominatim service — small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

module.exports = { geocodePlaces };