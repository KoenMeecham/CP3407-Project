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

// 1. Point to your dist folder
const distPath = path.join(__dirname, "../client/dist");

// 2. Serve static files (CSS, JS, Images)
app.use(express.static(distPath));

// 3. THE EXTREME FIX: Manual Middleware
// We use app.use() with no path. This catches EVERYTHING.
// Because it's at the bottom, it only runs if no API routes matched.
app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
            // If it fails, it's a file system issue, not a regex issue
            res.status(500).send("Server is up, but index.html is missing in client/dist");
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`FEED ME SERVER IS LIVE ON PORT ${PORT}`);
});