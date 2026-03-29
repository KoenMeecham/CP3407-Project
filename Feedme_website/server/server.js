require("dotenv").config();
const express = require("express");
const cors = require("cors");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");

// IMPORT CORRECTLY
const { checkJwt, attachUser } = require("./middleware/userauth");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/restaurants", restaurantRoutes);

// 🔥 THIS WAS CRASHING BEFORE — NOW FIXED
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

// DEBUG ROUTE (important)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});