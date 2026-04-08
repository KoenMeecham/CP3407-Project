const express = require("express");
const router = express.Router();
const db = require("../database");
const { checkJwt, attachUser } = require("../middleware/userauth");

// CREATE ORDER
router.post("/", checkJwt, attachUser, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      restaurant_id,
      total_price,
      items,
      order_type,
      delivery_fee,
      email,
      delivery_address,
      post_code,
    } = req.body;

    if (!restaurant_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    if (!userId && !email) {
      return res.status(400).json({ error: "Email is required for guest checkout" });
    }

    const validOrderType = order_type === "pickup" ? "pickup" : "delivery";
    const finalDeliveryFee =
      validOrderType === "delivery" ? Number(delivery_fee || 0) : 0;
    const finalTotalPrice = Number(total_price || 0);

    let finalAddressId = null;

    if (validOrderType === "delivery") {
      if (!delivery_address || !delivery_address.trim()) {
        return res.status(400).json({ error: "Delivery address is required" });
      }

      const [addressResult] = await db.query(
        `INSERT INTO Addresses (user_id, full_address, post_code)
         VALUES (?, ?, ?)`,
        [userId, delivery_address.trim(), post_code || "0000"]
      );

      finalAddressId = addressResult.insertId;
    }

    const [orderResult] = await db.query(
      `INSERT INTO Orders (user_id, email, restaurant_id, address_id, total_price, order_type, delivery_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email || null,
        restaurant_id,
        finalAddressId,
        finalTotalPrice,
        validOrderType,
        finalDeliveryFee,
        "pending",
      ]
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

// GET USER OR GUEST ORDERS
router.get("/", checkJwt, attachUser, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const guestEmail = req.query.email || null;

    let orders = [];

    if (userId) {
      const userEmail = req.user?.email || null;

      const [userOrders] = await db.query(
        `
        SELECT DISTINCT o.*
        FROM Orders o
        WHERE o.user_id = ?
           OR (? IS NOT NULL AND o.email = ?)
        ORDER BY o.created_at DESC
        `,
        [userId, userEmail, userEmail]
      );

      orders = userOrders;
    }
    else if (guestEmail) {
      const [guestOrders] = await db.query(
        `
        SELECT o.*
        FROM Orders o
        WHERE o.email = ?
        ORDER BY o.created_at DESC
        `,
        [guestEmail]
      );
      orders = guestOrders;
    } else {
      return res.json([]);
    }

    for (const order of orders) {
      const [items] = await db.query(
        `
        SELECT
          oi.menu_item_id AS id,
          oi.quantity,
          mi.name,
          mi.price,
          mi.restaurant_id
        FROM Order_Items oi
        JOIN Menu_Items mi ON mi.id = oi.menu_item_id
        WHERE oi.order_id = ?
        `,
        [order.id]
      );

      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;