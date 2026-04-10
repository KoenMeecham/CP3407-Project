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
    const cuisine = (req.query.cuisine || "").trim();
    const page = parsePositiveInt(req.query.page, 1);

    let limit = parsePositiveInt(req.query.limit, 20);
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search !== "") {
      conditions.push("r.name LIKE ?");
      params.push(`%${search}%`);
    }

    if (cuisine !== "") {
      conditions.push("r.category LIKE ?");
      params.push(`%${cuisine}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // COUNT
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS count FROM Restaurants r ${whereClause}`,
      params
    );

    const total = countResult[0]?.count || 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    // RESULTS
    const [results] = await db.query(
      `
      SELECT r.id, r.name, r.category, r.price_range
      FROM Restaurants r
      ${whereClause}
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
    const [results] = await db.query(
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
    const [results] = await db.query(
      `
      SELECT id, restaurant_id, category, name, description, price
      FROM Menu_Items
      WHERE restaurant_id = ?
      ORDER BY category ASC, name ASC
      `,
      [id]
    );

    res.json(results || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;