const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

async function planTrip({
  destination,
  interests,
  budget,
  travelers,
  duration,
}) {
  const prompt = `
You are a local travel expert who knows hidden, non-touristy spots.

Plan a trip with these details:
- Destination: ${destination}
- Interests: ${interests}
- Budget: ${budget}
- Number of travelers: ${travelers}
- Duration: ${duration} days

Respond with ONLY valid JSON (no markdown, no extra text) in exactly this shape:

{
  "summary": "short 1-2 sentence overview of the trip plan",
  "hiddenGems": [
    {
      "name": "",
      "type": "hidden gem OR famous spot with a local secret",
      "area": "specific neighborhood, locality, or nearest landmark in ${destination}",
      "description": "",
      "whyLocal": "",
      "mapsQuery": "search-friendly text like 'Place Name, ${destination}'"
    }
  ],
    "localFood": [
    {
      "name": "",
      "type": "near a hidden gem OR famous cultural classic",
      "nearSpot": "name of the hiddenGem or photographySpot from the lists above that this is closest to (or 'city-wide' if it's a famous spot everyone should know)",
      "area": "",
      "mustTryDish": "the one dish this place is known for",
      "description": "",
      "whereToFind": "",
      "mapsQuery": ""
    }
  ],
  "photographySpots": [
    { "name": "", "area": "", "description": "", "bestTime": "", "mapsQuery": "" }
  ],
  "localEvents": [
    { "name": "", "area": "", "description": "", "mapsQuery": "" }
  ],
  "budgetBreakdown": {
    "accommodation": "", "food": "", "transport": "", "activities": "", "total": ""
  },
  "smartSavings": {
    "touristCostEstimate": "",
    "localCostEstimate": "",
    "estimatedSavings": "",
    "suggestions": [""]
  }
}

For hiddenGems specifically: include a MIX — some genuinely off-the-beaten-path spots most tourists miss, AND some famous/well-known areas of ${destination}, but paired with a local secret about them (a less-crowded corner, a local-only timing, a nearby spot most tourists walk past). Mark each one's "type" accordingly.

Do NOT fix the number of items to exactly 3. Decide a sensible number based on how much ${destination} actually offers for these interests — a small town might only have 2-4 genuine items per category, while a large city could have 6-8. Never pad the list with repetitive or low-quality filler just to hit a number.

For every item, "area" must be a real, findable neighborhood, street, or landmark name in ${destination} (not vague like "downtown" or "somewhere local") so it can be searched on a map. "mapsQuery" should combine the place name and area in a way that would work well as a Google Maps search.

Keep descriptions short (1-2 sentences). Include 2-3 items in smartSavings.suggestions, and be honest and realistic comparing tourist vs. local costs.

For localFood specifically:
1. First decide the hiddenGems and photographySpots for this trip.
2. Then recommend food spots that are actually within short walking/travel distance of those specific spots or areas — so travelers can eat nearby without a separate trip across town. Set "nearSpot" to match the exact name of the related gem/spot.
3. In addition, include 1-2 famous, iconic, must-try food experiences of ${destination} as a whole (the dish or eatery every first-timer should know about, for cultural context) — even if not near a specific gem. Mark these with type "famous cultural classic" and nearSpot "city-wide".
4. Do not recommend food spots that require significant extra travel away from the other recommended areas unless they're a "famous cultural classic".
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

module.exports = { planTrip };
