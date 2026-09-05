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
    { "name": "", "area": "", "description": "", "whereToFind": "", "mapsQuery": "" }
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
