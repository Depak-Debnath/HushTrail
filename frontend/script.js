const tripForm = document.getElementById("tripForm");
const loadingSection = document.getElementById("loading");
const resultsSection = document.getElementById("results");
const assistantSection = document.getElementById("assistant");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const chatMessages = document.getElementById("chatMessages");

let currentTripPlan = null;
let chatHistory = [];

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
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      currentTripPlan = data;
      chatHistory = [];
      chatMessages.innerHTML = "";
      assistantSection.classList.remove("hidden");
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

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="gems">🗺️ Gems</button>
      <button class="tab-btn" data-tab="food">🍜 Food</button>
      <button class="tab-btn" data-tab="photo">📸 Photo</button>
      <button class="tab-btn" data-tab="events">🎉 Events</button>
      <button class="tab-btn" data-tab="budget">💰 Budget</button>
      <button class="tab-btn" data-tab="map">🗺️ Map</button>
    </div>

    <div class="tab-panel" data-panel="gems">
      <div class="card-grid">${renderCardList(data.hiddenGems, "Why local", "whyLocal")}</div>
    </div>

    <div class="tab-panel hidden" data-panel="food">
      <div class="card-grid">${data.localFood.map(item => `
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
        </div>
      `).join("")}</div>
    </div>

    <div class="tab-panel hidden" data-panel="photo">
      <div class="card-grid">${renderCardList(data.photographySpots, "Best time", "bestTime")}</div>
    </div>

    <div class="tab-panel hidden" data-panel="events">
      <div class="card-grid">${renderCardList(data.localEvents)}</div>
    </div>

    <div class="tab-panel hidden" data-panel="budget">
      <div class="budget-grid">
        <div><span>Accommodation</span><strong>${data.budgetBreakdown.accommodation}</strong></div>
        <div><span>Food</span><strong>${data.budgetBreakdown.food}</strong></div>
        <div><span>Transport</span><strong>${data.budgetBreakdown.transport}</strong></div>
        <div><span>Activities</span><strong>${data.budgetBreakdown.activities}</strong></div>
        <div class="total"><span>Total</span><strong>${data.budgetBreakdown.total}</strong></div>
      </div>

      <h4 class="savings-title">✨ Smart Savings</h4>
      <div class="savings-card">
        <p><strong>Typical tourist cost:</strong> ${data.smartSavings.touristCostEstimate}</p>
        <p><strong>Your local-focused cost:</strong> ${data.smartSavings.localCostEstimate}</p>
        <p class="savings-highlight">You could save: ${data.smartSavings.estimatedSavings}</p>
        <ul>${data.smartSavings.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>
      </div>
    </div>

    <div class="tab-panel hidden" data-panel="map">
      <div id="mapContainer" style="height: 400px; border-radius: 10px;"></div>
    </div>
  `;

  setupTabs();
}

let mapLoaded = false;
let leafletMap = null;

function setupTabs() {
  const tabButtons = resultsSection.querySelectorAll(".tab-btn");
  const tabPanels = resultsSection.querySelectorAll(".tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.add("hidden"));

      btn.classList.add("active");
      resultsSection.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.remove("hidden");

      if (btn.dataset.tab === "map" && !mapLoaded) {
        loadMap();
      }
    });
  });
}

async function loadMap() {
  const mapContainer = document.getElementById("mapContainer");
  mapContainer.innerHTML = "Loading map...";

  const allItems = [
    ...currentTripPlan.hiddenGems,
    ...currentTripPlan.localFood,
    ...currentTripPlan.photographySpots,
  ];

  try {
    const response = await fetch(`${BACKEND_URL}/api/geocode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: allItems }),
    });

    const data = await response.json();
    mapContainer.innerHTML = "";

    if (!data.places || !data.places.length) {
      mapContainer.innerHTML = "<p>Could not load map locations.</p>";
      return;
    }

    leafletMap = L.map("mapContainer").setView([data.places[0].lat, data.places[0].lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(leafletMap);

    data.places.forEach(place => {
      L.marker([place.lat, place.lng])
        .addTo(leafletMap)
        .bindPopup(`<strong>${place.name}</strong><br>${place.description}`);
    });

    mapLoaded = true;
  } catch (error) {
    mapContainer.innerHTML = "<p>⚠️ Failed to load map.</p>";
    console.error(error);
  }
}


assistantForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = assistantInput.value;
  addChatMessage("user", question);
  assistantInput.value = "";

  addChatMessage("assistant", "Thinking...", true);

  try {
    const response = await fetch(`${BACKEND_URL}/api/trip-assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripPlan: currentTripPlan, question, history: chatHistory }),
    });

    const data = await response.json();
    removeTypingMessage();

    const answer = data.answer || data.error || "Something went wrong.";
    addChatMessage("assistant", answer);

    chatHistory.push({ role: "user", text: question });
    chatHistory.push({ role: "assistant", text: answer });
  } catch (error) {
    removeTypingMessage();
    addChatMessage("assistant", "⚠️ Could not reach the server.");
    console.error(error);
  }
});

function addChatMessage(role, text, isTyping = false) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  if (isTyping) bubble.id = "typingBubble";
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingMessage() {
  const typing = document.getElementById("typingBubble");
  if (typing) typing.remove();
}