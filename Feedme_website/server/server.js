// server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");

const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   COGNITO JWT MIDDLEWARE
========================= */
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

/* =========================
   ATTACH USER TO REQUEST
========================= */
const attachUser = (req, res, next) => {
  const sub = req.auth?.sub;
  const email = req.auth?.email || req.auth?.["email"];

  if (!sub) return res.status(401).json({ error: "No sub found in token" });

  db.query("SELECT * FROM Users WHERE cognito_sub = ?", [sub], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      db.query(
        "INSERT INTO Users (cognito_sub, email, role) VALUES (?, ?, 'user')",
        [sub, email],
        (insErr) => {
          if (insErr) return res.status(500).json(insErr);
          req.user = { sub, email };
          next();
        }
      );
    } else {
      req.user = { sub, email };
      next();
    }
  });
};

/* =========================
   API ROUTES FIRST
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

/* =========================
   API 404 HANDLER
========================= */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../client/dist")));

// IMPORTANT: SPA fallback (Express 5 safe version)
app.get("(.*)", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

