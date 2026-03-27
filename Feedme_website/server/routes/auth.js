const express = require("express");
const router = express.Router();
const db = require("../database"); // Ensure this points to your db connection
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// REGISTER & SYNC
router.post("/register", (req, res) => {
    const { email, password, f_name } = req.body;

    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email })
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        
        const cognitoSub = result.userSub; // This is the unique ID from AWS

        // Sync to local MySQL immediately so the user exists for future orders
        const sql = "INSERT INTO Users (email, cognito_sub, f_name, role) VALUES (?, ?, ?, 'user')";
        db.query(sql, [email, cognitoSub, f_name], (dbErr) => {
            if (dbErr) {
                console.error("DB Sync Error:", dbErr);
                // We don't return error here because the user IS created in Cognito
            }
            res.json({ 
                message: "User registered. Please check email for verification.",
                sub: cognitoSub 
            });
        });
    });
});

// LOGIN (Via Cognito)
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });

    const userData = {
        Username: email,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            const accessToken = result.getAccessToken().getJwtToken();
            const sub = result.getAccessToken().payload.sub;

            // Get user info from local DB to return to frontend
            db.query("SELECT * FROM Users WHERE cognito_sub = ?", [sub], (err, results) => {
                if (err || results.length === 0) return res.status(404).json({ message: "User profile not found" });
                
                res.json({
                    token: accessToken,
                    user: {
                        id: results[0].user_id,
                        email: results[0].email,
                        name: results[0].f_name,
                        role: results[0].role
                    }
                });
            });
        },
        onFailure: (err) => {
            res.status(401).json({ error: err.message });
        },
    });
});

module.exports = router;