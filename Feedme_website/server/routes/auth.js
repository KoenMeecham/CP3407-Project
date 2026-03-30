const express = require("express");
const router = express.Router();
const db = require("../database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { f_name, l_name, email, password } = req.body;

  try {
    // Validate input
    if (!f_name || !l_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log("REQ BODY:", req.body);
    // Check if user exists
    const [existing] = await db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO Users (f_name, l_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [f_name, l_name, email, hashedPassword, "customer"]
    );

    // Create token immediately (so frontend login() works)
    const token = jwt.sign(
      {
        id: result.insertId,
        email,
        role: "customer",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertId,
        email,
        role: "customer",
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;