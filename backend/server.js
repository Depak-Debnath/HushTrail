require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { planTrip, askTripAssistant } = require("./geminiService");

const app = express();

app.use(cors());
app.use(express.json());

// Health check route — just to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "HushTrail backend is running 🚀" });
});

// API test route — proves frontend can talk to backend
app.post("/api/plan-trip", async (req, res) => {
  const { destination, interests, budget, travelers, duration } = req.body;

  try {
    const tripPlan = await planTrip({ destination, interests, budget, travelers, duration });
    res.json(tripPlan);
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to generate trip plan. Please try again." });
  }
});



app.post("/api/trip-assistant", async (req, res) => {
  const { tripPlan, question, history } = req.body;

  if (!tripPlan || !question) {
    return res.status(400).json({ error: "Missing trip plan or question." });
  }

  try {
    const answer = await askTripAssistant({ tripPlan, question, history });
    res.json({ answer });
  } catch (error) {
    console.error("Trip assistant error:", error);
    res.status(500).json({ error: "Could not get an answer right now. Try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HushTrail server running on http://localhost:${PORT}`);
});