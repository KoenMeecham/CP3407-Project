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
      address_id,
      email,
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
    const finalAddressId =
      validOrderType === "delivery" ? address_id : null;
    const finalTotalPrice = Number(total_price || 0);

    if (validOrderType === "delivery" && !finalAddressId) {
      return res.status(400).json({ error: "Delivery address is required" });
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
      const [userOrders] = await db.query(
        `
        SELECT o.*
        FROM Orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        `,
        [userId]
      );
      orders = userOrders;
    } else if (guestEmail) {
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

    res.json(orders);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;