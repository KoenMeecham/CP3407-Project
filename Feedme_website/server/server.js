require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");

// ❌ REMOVE THIS LINE (no more custom auth)
// const authRoutes = require("./routes/auth");

const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   COGNITO JWT MIDDLEWARE
========================= */
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri:
      "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_9WmF0Ctcw/.well-known/jwks.json",
  }),
  audience: "3lllfldg85qibrp8q9tt7vhce9",
  issuer:
    "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_9WmF0Ctcw",
  algorithms: ["RS256"],
});

/* =========================
   ATTACH USER TO REQUEST
========================= */
const attachUser = (req, res, next) => {
  const sub = req.auth?.sub;
  const email = req.auth?.email;

  if (!sub) return res.status(401).json({ error: "Invalid token" });

  db.query(
    "SELECT * FROM Users WHERE cognito_sub = ?",
    [sub],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        db.query(
          "INSERT INTO Users (cognito_sub, email) VALUES (?, ?)",
          [sub, email]
        );
      }

      req.user = { sub, email };
      next();
    }
  );
};

/* =========================
   ROUTES
========================= */

// public routes
app.use("/api/restaurants", restaurantRoutes);

// protected routes
app.use("/api/orders", checkJwt, attachUser, orderRoutes);

/* =========================
   FRONTEND (React build)
========================= */
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});