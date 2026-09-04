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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HushTrail server running on http://localhost:${PORT}`);
});