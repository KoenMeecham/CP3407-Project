const express = require("express");
const router = express.Router();
const db = require("../database");
const { checkJwt, attachUser } = require("../middleware/userauth");

function getEtaDetails(status, createdAt) {
  const now = new Date();

  if (status === "cancelled") {
    return {
      etaLabel: "Cancelled",
      estimatedMinutesRemaining: null,
      estimatedDeliveryTime: null,
    };
  }

  if (status === "delivered") {
    return {
      etaLabel: "Delivered",
      estimatedMinutesRemaining: 0,
      estimatedDeliveryTime: null,
    };
  }

  let targetMinutes = 40;

  if (status === "placed") targetMinutes = 40;
  if (status === "preparing") targetMinutes = 25;
  if (status === "ready") targetMinutes = 10;

  const created = createdAt ? new Date(createdAt) : now;
  const etaTime = new Date(created.getTime() + targetMinutes * 60000);
  const minsRemaining = Math.max(
    0,
    Math.ceil((etaTime.getTime() - now.getTime()) / 60000)
  );

  return {
    etaLabel: minsRemaining === 0 ? "Arriving soon" : `${minsRemaining} min`,
    estimatedMinutesRemaining: minsRemaining,
    estimatedDeliveryTime: etaTime,
  };
}

function normaliseOrder(order) {
  const eta = getEtaDetails(order.status, order.created_at);

  return {
    ...order,
    etaLabel: eta.etaLabel,
    estimatedMinutesRemaining: eta.estimatedMinutesRemaining,
    estimatedDeliveryTime: eta.estimatedDeliveryTime,
  };
}

async function attachItemsToOrders(orders) {
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

  return orders.map(normaliseOrder);
}

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

    if (!restaurant_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    if (!userId && !email) {
      return res
        .status(400)
        .json({ error: "Email is required for guest checkout" });
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
        `
        INSERT INTO Addresses (user_id, full_address, post_code)
        VALUES (?, ?, ?)
        `,
        [userId, delivery_address.trim(), post_code || "0000"]
      );

      finalAddressId = addressResult.insertId;
    }

    const [orderResult] = await db.query(
      `
      INSERT INTO Orders
      (user_id, email, restaurant_id, address_id, total_price, order_type, delivery_fee, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
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
        `
        INSERT INTO Order_Items (order_id, menu_item_id, quantity)
        VALUES (?, ?, ?)
        `,
        [orderId, item.id, item.quantity]
      );
    }

    res.json({ success: true, orderId });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

// GET ALL USER OR GUEST ORDERS
router.get("/", checkJwt, attachUser, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const guestEmail = req.query.email || null;

    let orders = [];

    if (userId) {
      const [userOrders] = await db.query(
        `
        SELECT DISTINCT o.*
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

    const finalOrders = await attachItemsToOrders(orders);
    res.json(finalOrders);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET SINGLE ORDER
router.get("/:id", checkJwt, attachUser, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = req.user?.id || null;
    const guestEmail = req.query.email || null;

    const [rows] = await db.query(
      `
      SELECT o.*
      FROM Orders o
      WHERE o.id = ?
      `,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];

    const isOwner =
      (userId && order.user_id === userId) ||
      (!userId && guestEmail && order.email === guestEmail);

    if (!isOwner) {
      return res.status(403).json({ error: "Not authorised to view this order" });
    }

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
      [orderId]
    );

    order.items = items;

    res.json(normaliseOrder(order));
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// GET ORDER STATUS
router.get("/:id/status", checkJwt, attachUser, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = req.user?.id || null;
    const guestEmail = req.query.email || null;

    const [rows] = await db.query(
      `
      SELECT id, user_id, email, status, created_at, updated_at
      FROM Orders
      WHERE id = ?
      `,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];

    const isOwner =
      (userId && order.user_id === userId) ||
      (!userId && guestEmail && order.email === guestEmail);

    if (!isOwner) {
      return res.status(403).json({ error: "Not authorised to view this order" });
    }

    const finalOrder = normaliseOrder(order);
    res.json(finalOrder);
  } catch (err) {
    console.error("GET STATUS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

// CANCEL ORDER
router.patch("/:id/cancel", checkJwt, attachUser, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = req.user?.id || null;
    const guestEmail = req.body.email || req.query.email || null;

    const [rows] = await db.query(
      `
      SELECT *
      FROM Orders
      WHERE id = ?
      `,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];

    const isOwner =
      (userId && order.user_id === userId) ||
      (!userId && guestEmail && order.email === guestEmail);

    if (!isOwner) {
      return res.status(403).json({ error: "Not authorised to cancel this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        error: "Only orders that are still pending can be cancelled",
      });
    }

    await db.query(
      `
      UPDATE Orders
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [orderId]
    );

    const [updatedRows] = await db.query(
      `
      SELECT *
      FROM Orders
      WHERE id = ?
      `,
      [orderId]
    );

    res.json({
      success: true,
      order: normaliseOrder(updatedRows[0]),
    });
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// OPTIONAL TEST ROUTE TO SIMULATE STATUS PROGRESS
router.patch("/:id/status", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const allowed = ["placed", "preparing", "ready", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.query(
      `
      UPDATE Orders
      SET status = ?
      WHERE id = ?
      `,
      [status, orderId]
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM Orders
      WHERE id = ?
      `,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(normaliseOrder(rows[0]));
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;