require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check route — just to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "HushTrail backend is running 🚀" });
});

// Temporary test route — proves frontend can talk to backend
app.post("/api/plan-trip", (req, res) => {
  const { destination, interests, budget, duration } = req.body;

  console.log("Received trip request:", req.body);

  res.json({
    message: `Got it! Planning a ${duration}-day trip to ${destination} for someone interested in ${interests}, budget ${budget}.`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HushTrail server running on http://localhost:${PORT}`);
});