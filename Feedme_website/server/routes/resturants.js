const express = require("express");
const router = express.Router();
const db = require("../db");

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// GET ALL RESTAURANTS
router.get("/", (req, res) => {
  const search = (req.query.q || "").trim();
  const page = parsePositiveInt(req.query.page, 1);

  let limit = parsePositiveInt(req.query.limit, 20);
  if (limit > 50) limit = 50;

  if (search !== "" && search.length < 2) {
    return res.json({
      page: 1,
      totalPages: 0,
      totalRestaurants: 0,
      restaurants: []
    });
  }

  const offset = (page - 1) * limit;

  let baseQuery = "FROM Restaurants r";
  let params = [];

  if (search !== "") {
    baseQuery = "FROM Restaurants r WHERE r.name LIKE ?";
    params = [`%${search}%`];
  }

  db.query(`SELECT COUNT(*) AS count ${baseQuery}`, params, (err, countResult) => {
    const total = countResult[0].count;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    let query = `
      SELECT r.id, r.name, r.category, r.price_range
      ${baseQuery}
      ORDER BY r.name ASC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [...params, limit, offset], (err, results) => {
      res.json({
        page,
        totalPages,
        totalRestaurants: total,
        restaurants: results
      });
    });
  });
});

// GET ONE RESTAURANT
router.get("/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  db.query("SELECT * FROM Restaurants WHERE id = ?", [id], (err, results) => {
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  });
});

// GET MENU
router.get("/:id/menu", (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  db.query(
    "SELECT * FROM Menu_Items WHERE restaurant_id = ?",
    [id],
    (err, results) => res.json(results)
  );
});

module.exports = router;