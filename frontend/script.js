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

  // Show loading, hide old results
  loadingSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");

  try {
    const response = await fetch(`${BACKEND_URL}/api/plan-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, interests, budget, duration }),
    });

    const data = await response.json();

    resultsSection.innerHTML = `<p>${data.message}</p>`;
  } catch (error) {
    resultsSection.innerHTML = `<p>⚠️ Could not connect to the server. Is the backend running?</p>`;
    console.error(error);
  } finally {
    loadingSection.classList.add("hidden");
    resultsSection.classList.remove("hidden");
  }
});