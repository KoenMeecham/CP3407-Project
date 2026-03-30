const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database'); 
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; 

router.post('/register', async (req, res) => {
    const { f_name, l_name, email, password } = req.body;
    try {
        await db.query("USE feedme");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO Users (f_name, l_name, email, password, role) VALUES (?, ?, ?, ?, 'customer')";
        const [result] = await db.execute(sql, [f_name, l_name, email, hashedPassword]);

        const newUser = { id: result.insertId, f_name, l_name, email, role: 'customer' };
        const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed. Email might already exist." });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        await db.query("USE feedme");

        const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const userData = { 
        id: user.user_id, 
        name: user.f_name, 
        email: user.email, 
        role: user.role 
        };
        
        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login error" });
    }
});

module.exports = router;