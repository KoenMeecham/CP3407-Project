require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const { checkJwt, attachUser } = require("./middleware/auth"); // Assuming you moved this

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   API ROUTES ONLY
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

// Health check to verify the API is up
app.get("/api/health", (req, res) => {
  res.json({ status: "API is online", timestamp: new Date() });
});

// Final API 404
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});