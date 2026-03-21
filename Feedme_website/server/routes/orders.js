const express = require("express");
const router = express.Router();
const db = require("../db");
const sendEmail = require("../services/email");

// CREATE ORDER
router.post("/", (req, res) => {
  const { user_id, restaurant_id, address_id, total_price, items } = req.body;

  db.query(
    `INSERT INTO Orders (user_id, restaurant_id, address_id, status, total_price)
     VALUES (?, ?, ?, 'pending', ?)`,
    [user_id, restaurant_id, address_id, total_price],
    (err, result) => {
      const orderId = result.insertId;

      items.forEach(item => {
        db.query(
          "INSERT INTO Order_Items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)",
          [orderId, item.id, item.quantity]
        );
      });

      sendEmail(process.env.SES_EMAIL, `Order #${orderId} created`);

      res.json({ message: "Order created" });
    }
  );
});

// GET ORDERS (ADMIN)
router.get("/", (req, res) => {
  db.query("SELECT * FROM Orders ORDER BY created_at DESC", (err, results) => {
    res.json(results);
  });
});

module.exports = router;