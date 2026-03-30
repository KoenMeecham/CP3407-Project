const express = require("express");
const router = express.Router();
const db = require("../database");

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// GET ALL RESTAURANTS
router.get("/", async (req, res) => {
  try {
    const search = (req.query.q || "").trim();
    const page = parsePositiveInt(req.query.page, 1);

    let limit = parsePositiveInt(req.query.limit, 20);
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    let baseQuery = "FROM Restaurants r";
    let params = [];

    if (search !== "") {
      baseQuery = "FROM Restaurants r WHERE r.name LIKE ?";
      params = [`%${search}%`];
    }

    // COUNT
    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) AS count ${baseQuery}`,
      params
    );

    const total = countResult[0]?.count || 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    // RESULTS
    const [results] = await db.promise().query(
      `
      SELECT r.id, r.name, r.category, r.price_range
      ${baseQuery}
      ORDER BY r.name ASC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      page,
      totalPages,
      totalRestaurants: total,
      restaurants: results || [],
    });

  } catch (err) {
    console.error("RESTAURANT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// GET ONE RESTAURANT
router.get("/:id", async (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  try {
    const [results] = await db.promise().query(
      "SELECT * FROM Restaurants WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// GET MENU
router.get("/:id/menu", async (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  try {
    const [results] = await db.promise().query(
      "SELECT * FROM Menu_Items WHERE restaurant_id = ?",
      [id]
    );

    res.json(results || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;