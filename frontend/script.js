const tripForm = document.getElementById("tripForm");
const loadingSection = document.getElementById("loading");
const resultsSection = document.getElementById("results");

const BACKEND_URL = "http://localhost:5000";

tripForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop the page from refreshing on submit

  const destination = document.getElementById("destination").value;
  const interests = document.getElementById("interests").value;
  const budget = document.getElementById("budget").value;
  const duration = document.getElementById("duration").value;
  const travelers = document.getElementById("travelers").value;

  // Show loading, hide old results
  loadingSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");

  try {
    const response = await fetch(`${BACKEND_URL}/api/plan-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        interests,
        budget,
        duration,
        travelers,
      }),
    });

    const data = await response.json();

    if (data.error) {
      resultsSection.innerHTML = `<p>⚠️ ${data.error}</p>`;
    } else {
      renderResults(data);
    }
  } catch (error) {
    resultsSection.innerHTML = `<p>⚠️ Could not connect to the server. Is the backend running?</p>`;
    console.error(error);
  } finally {
    loadingSection.classList.add("hidden");
    resultsSection.classList.remove("hidden");
  }
});

function mapsLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function renderCardList(items, extraFieldLabel, extraField) {
  return items
    .map(
      (item) => `
    <div class="spot-card">
      <div class="spot-header">
        <h4>${item.name}</h4>
        ${item.type ? `<span class="badge">${item.type}</span>` : ""}
      </div>
      ${item.area ? `<p class="area">📍 ${item.area}</p>` : ""}
      <p>${item.description}</p>
      ${extraField && item[extraField] ? `<p class="extra"><strong>${extraFieldLabel}:</strong> ${item[extraField]}</p>` : ""}
      ${item.mapsQuery ? `<a href="${mapsLink(item.mapsQuery)}" target="_blank" rel="noopener noreferrer">Open in Maps →</a>` : ""}
    </div>
  `,
    )
    .join("");
}

function renderResults(data) {
  resultsSection.innerHTML = `
    <p class="summary">${data.summary}</p>

    <h3>🗺️ Hidden Gems</h3>
    <div class="card-grid">${renderCardList(data.hiddenGems, "Why local", "whyLocal")}</div>

    <h3>🍜 Local Food (near your spots)</h3>
    <div class="card-grid">${data.localFood
      .map(
        (item) => `
      <div class="spot-card">
        <div class="spot-header">
          <h4>${item.name}</h4>
          <span class="badge">${item.type === "famous cultural classic" ? "🌟 Must-try" : "📍 Near " + item.nearSpot}</span>
        </div>
        <p class="area">📍 ${item.area}</p>
        <p><strong>Must try:</strong> ${item.mustTryDish}</p>
        <p>${item.description}</p>
        <p class="extra"><strong>Where to find:</strong> ${item.whereToFind}</p>
        <a href="${mapsLink(item.mapsQuery)}" target="_blank" rel="noopener noreferrer">Open in Maps →</a>
      </div>`,
      )
      .join("")}</div>

    <h3>📸 Photography Spots</h3>
    <div class="card-grid">${renderCardList(data.photographySpots, "Best time", "bestTime")}</div>

    <h3>🎉 Local Events</h3>
    <div class="card-grid">${renderCardList(data.localEvents)}</div>

    <h3>💰 Budget Breakdown</h3>
    <div class="budget-grid">
      <div><span>Accommodation</span><strong>${data.budgetBreakdown.accommodation}</strong></div>
      <div><span>Food</span><strong>${data.budgetBreakdown.food}</strong></div>
      <div><span>Transport</span><strong>${data.budgetBreakdown.transport}</strong></div>
      <div><span>Activities</span><strong>${data.budgetBreakdown.activities}</strong></div>
      <div class="total"><span>Total</span><strong>${data.budgetBreakdown.total}</strong></div>
    </div>

    <h3>✨ Smart Savings</h3>
    <div class="savings-card">
      <p><strong>Typical tourist cost:</strong> ${data.smartSavings.touristCostEstimate}</p>
      <p><strong>Your local-focused cost:</strong> ${data.smartSavings.localCostEstimate}</p>
      <p class="savings-highlight">You could save: ${data.smartSavings.estimatedSavings}</p>
      <ul>${data.smartSavings.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>
    </div>
  `;
}
