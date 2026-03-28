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
  const sub = req.auth?.sub;
  const email = req.auth?.email || req.auth?.["email"];

  if (!sub) return res.status(401).json({ error: "No sub found in token" });

  db.query("SELECT * FROM Users WHERE cognito_sub = ?", [sub], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      db.query(
        "INSERT INTO Users (cognito_sub, email, role) VALUES (?, ?, 'user')",
        [sub, email],
        (insErr) => {
          if (insErr) return res.status(500).json(insErr);
          req.user = { sub, email };
          next();
        }
      );
    } else {
      req.user = { sub, email };
      next();
    }
  });
};

module.exports = { checkJwt, attachUser };