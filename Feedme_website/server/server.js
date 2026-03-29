require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

// Import your routes
const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
// Import the middleware from your auth file
const { checkJwt, attachUser } = require("./routes/auth"); 

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// API ROUTES
// Note: If /api/auth contains login/callback routes, keep it. 
// Otherwise, you just need the middleware below.
app.use("/api/restaurants", restaurantRoutes);

// Protected Routes: Only logged-in users can access /api/orders
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER IS TRULY LIVE ON PORT ${PORT}`);
});