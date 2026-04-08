const express = require("express");
const router = express.Router();
const db = require("../database");

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { id } = req.user;
    const { restaurant_id, total_price, items, order_type, delivery_fee, address_id } = req.body;

    if (!restaurant_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const validOrderType = order_type === "pickup" ? "pickup" : "delivery";
    const finalDeliveryFee = validOrderType === "delivery" ? Number(delivery_fee || 0) : 0;
    const finalAddressId = validOrderType === "delivery" ? address_id : null;

    if (validOrderType === "delivery" && !finalAddressId) {
      return res.status(400).json({ error: "Delivery address is required" });
    }

    const finalTotalPrice = Number(total_price || 0);

    const [orderResult] = await db.query(
      `INSERT INTO Orders (user_id, restaurant_id, address_id, total_price, order_type, delivery_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, restaurant_id, finalAddressId, finalTotalPrice, validOrderType, finalDeliveryFee, "pending"]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.query(
        `INSERT INTO Order_Items (order_id, menu_item_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, item.id, item.quantity]
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
    const { id } = req.user;

    const [orders] = await db.query(
      `
      SELECT o.*
      FROM Orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      `,
      [id]
    );

    res.json(orders);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;