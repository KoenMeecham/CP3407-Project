const express = require("express");
const router = express.Router();
const db = require("../database");

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { sub, email } = req.user;
    const { restaurant_id, total_price, items } = req.body;

    if (!restaurant_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // ✅ ensure user exists
    await db.promise().execute(
      `INSERT INTO Users (cognito_sub, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      [sub, email]
    );

    // ✅ create order
    const [orderResult] = await db.promise().execute(
      `INSERT INTO Orders (user_id, restaurant_id, total_price)
       VALUES (
         (SELECT user_id FROM Users WHERE cognito_sub = ?),
         ?, ?
       )`,
      [sub, restaurant_id, total_price]
    );

    const orderId = orderResult.insertId;

    // ✅ insert items
    for (const item of items) {
      await db.promise().execute(
        `INSERT INTO Order_Items (order_id, menu_item_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.json({ success: true, orderId });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

// GET USER ORDERS
router.get("/", async (req, res) => {
  try {
    const { sub } = req.user;

    const [orders] = await db.promise().execute(
      `SELECT o.*
       FROM Orders o
       JOIN Users u ON o.user_id = u.user_id
       WHERE u.cognito_sub = ?
       ORDER BY o.created_at DESC`,
      [sub]
    );

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;