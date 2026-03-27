const express = require("express");
const router = express.Router();
const db = require("../database");
const { sendOrderEmail } = require("../services/email");

// CREATE ORDER
router.post("/", async (req, res) => {
  const { restaurant_id, address_id, total_price, items } = req.body;
  
  // These should come from your JWT middleware
  const userSub = req.user.sub; 
  const email = req.user.email;

  // 1. Get local user_id using Cognito Sub
  db.query(
    "SELECT user_id FROM Users WHERE cognito_sub = ?",
    [userSub],
    (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ error: "User not found in local DB" });

      const user_id = results[0].user_id;

      // 2. Create the Order
      const orderSql = "INSERT INTO Orders (user_id, restaurant_id, address_id, total_price, status, created_at, email) VALUES (?, ?, ?, ?, 'pending', NOW(), ?)";
      db.query(orderSql, [user_id, restaurant_id, address_id, total_price, email], (err, result) => {
          if (err) return res.status(500).json(err);

          const order_id = result.insertId;

          // 3. Insert Order Items
          const itemQueries = items.map((item) => {
            return new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO Order_Items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)",
                [order_id, item.id, item.quantity],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(itemQueries)
            .then(async () => {
              // 4. Send Confirmation Email via Resend
              await sendOrderEmail(email, {
                total_price,
                items,
              });

              res.json({ message: "Order placed successfully", order_id });
            })
            .catch((err) => res.status(500).json({ error: "Failed to save items", detail: err }));
        }
      );
    }
  );
});

// GET USER ORDERS
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM Orders WHERE email = ? ORDER BY created_at DESC",
    [req.user.email],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

module.exports = router;