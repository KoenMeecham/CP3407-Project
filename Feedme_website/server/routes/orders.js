const express = require("express");
const router = express.Router();
const db = require("../database");
const { sendOrderEmail } = require("../services/email");

/* =========================
   CREATE ORDER
========================= */
router.post("/", async (req, res) => {
  try {
    const { restaurant_id, address_id, total_price, items } = req.body;

    const email = req.user.email;

    // get user_id from DB
    db.query(
      "SELECT user_id FROM Users WHERE cognito_sub = ?",
      [req.user.sub],
      (err, results) => {
        if (err) return res.status(500).json(err);

        const user_id = results[0].user_id;

        // create order
        db.query(
          "INSERT INTO Orders (user_id, restaurant_id, address_id, total_price, status, created_at, email) VALUES (?, ?, ?, ?, 'pending', NOW(), ?)",
          [user_id, restaurant_id, address_id, total_price, email],
          (err, result) => {
            if (err) return res.status(500).json(err);

            const order_id = result.insertId;

            // insert items
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
                // send email
                await sendOrderEmail(email, {
                  total_price,
                  items,
                });

                res.json({ message: "Order placed", order_id });
              })
              .catch((err) => res.status(500).json(err));
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

/* =========================
   GET ORDERS
========================= */
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