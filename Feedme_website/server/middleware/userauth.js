const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const db = require("../database");

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  }),
  audience: process.env.COGNITO_CLIENT_ID,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
  algorithms: ["RS256"],
});

const attachUser = (req, res, next) => {
  // express-jwt puts the decoded token in req.auth
  const sub = req.auth?.sub;
  const email = req.auth?.email; 

  if (!sub) return res.status(401).json({ error: "No sub found in token" });

  db.query("SELECT * FROM Users WHERE cognito_sub = ?", [sub], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });

    if (results.length === 0) {
      // Auto-register the user if they don't exist in our MySQL table yet
      db.query(
        "INSERT INTO Users (cognito_sub, email, role) VALUES (?, ?, 'user')",
        [sub, email],
        (insErr, insResults) => {
          if (insErr) return res.status(500).json({ error: "Failed to create user", details: insErr });
          
          // Set req.user for the next middleware/route
          req.user = { id: insResults.insertId, cognito_sub: sub, email, role: 'user' };
          next();
        }
      );
    } else {
      // Use the existing user data from the database
      req.user = results[0];
      next();
    }
  });
};

module.exports = { checkJwt, attachUser };