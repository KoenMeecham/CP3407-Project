require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");

// --- MODULAR MIDDLEWARE REPLACED WITH DIRECT LOGIC ---
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  }),
  audience: process.env.COGNITO_CLIENT_ID,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
  algorithms: ["RS256"],
});

const attachUser = (req, res, next) => {
  const sub = req.auth?.sub;
  if (!sub) return res.status(401).json({ error: "No sub found in token" });
  
  db.query("SELECT * FROM Users WHERE cognito_sub = ?", [sub], (err, results) => {
    if (err) return res.status(500).json(err);
    req.user = results[0] || { sub };
    next();
  });
};

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

// NO FRONTEND ROUTES HERE (Nginx handles it now)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER IS TRULY LIVE ON PORT ${PORT}`);
});