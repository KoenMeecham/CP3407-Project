const express = require("express");
const router = express.Router();
const db = require("../db");
const sendEmail = require("../services/email");

// CREATE ORDER
router.post("/", (req, res) => {
  const { user_id, restaurant_id, address_id, total_price, items, email } = req.body;

  db.query(
    `INSERT INTO Orders (user_id, restaurant_id, address_id, status, total_price)
     VALUES (?, ?, ?, 'pending', ?)`,
    [user_id, restaurant_id, address_id, total_price],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      const orderId = result.insertId;

      // insert order items
      items.forEach(item => {
        db.query(
          "INSERT INTO Order_Items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)",
          [orderId, item.id, item.quantity]
        );
      });

      // ✅ SEND EMAIL HERE
      sendEmail(email, `Order #${orderId} confirmed`)
        .then(() => console.log("Email sent"))
        .catch(err => console.error("Email error:", err));

      res.json({ message: "Order created" });
    }
  );
});

// GET ORDERS
router.get("/", (req, res) => {
  db.query("SELECT * FROM Orders ORDER BY created_at DESC", (err, results) => {
    res.json(results);
  });
});

module.exports = router;