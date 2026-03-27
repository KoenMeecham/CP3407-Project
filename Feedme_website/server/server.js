require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const { checkJwt, attachUser } = require("./middleware/userauth");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

// API 404
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// STATIC FILES
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));

// THE EXTREME FIX: No strings, no regex. 
// This function handles the "fallback" for the SPA.
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});