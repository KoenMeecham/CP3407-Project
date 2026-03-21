const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

// REGISTER
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO Users (f_name, l_name, email, password, role) VALUES (?, ?, ?, ?, 'customer')",
    [firstName, lastName, email, hashed],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        user: {
          id: result.insertId,
          email,
          name: firstName,
          role: "customer"
        }
      });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM Users WHERE email = ?", [email], async (err, results) => {
    if (results.length === 0) return res.status(401).json({ message: "Invalid login" });

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid login" });

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        name: user.f_name,
        role: user.role
      }
    });
  });
});

module.exports = router;