const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

async function planTrip({ destination, interests, budget, travelers, duration }) {
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
    { "name": "", "description": "", "whyLocal": "" }
  ],
  "localFood": [
    { "name": "", "description": "", "whereToFind": "" }
  ],
  "photographySpots": [
    { "name": "", "description": "", "bestTime": "" }
  ],
  "localEvents": [
    { "name": "", "description": "" }
  ],
  "budgetBreakdown": {
    "accommodation": "",
    "food": "",
    "transport": "",
    "activities": "",
    "total": ""
  }
}

Include 3 items in each list. Keep descriptions short (1-2 sentences).
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