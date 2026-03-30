require("dotenv").config();
const express = require("express");
const cors = require("cors");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./auth"); // Import your new auth.js

const { checkJwt, attachUser } = require("./middleware/userauth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRoutes); 

// RESTAURANT ROUTES
app.use("/api/restaurants", restaurantRoutes);

// PROTECTED ROUTES
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

// DEBUG ROUTE
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", database: "feedme" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});