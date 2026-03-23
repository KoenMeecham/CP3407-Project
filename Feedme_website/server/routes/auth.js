const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

// REGISTER
// Feedme_website/server/routes/auth.js
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

router.post("/register", (req, res) => {
    const { email, password } = req.body;

    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email })
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        
        // Success! User is created in Cognito. 
        // You can now also save them to your local MySQL database for profile info.
        res.json({ message: "User registered. Please check email for verification." });
    });
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