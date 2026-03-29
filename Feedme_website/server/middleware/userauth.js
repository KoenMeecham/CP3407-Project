const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const REGION = "ap-southeast-2";
const USER_POOL_ID = "ap-southeast-2_9WmF0Ctcw";

// JWT check middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  }),
  audience: "3lllfldg85qibrp8q9tt7vhce9",
  issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
  algorithms: ["RS256"],
});

// Attach user info (VERY IMPORTANT)
const attachUser = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ error: "No auth data" });
  }

  req.user = {
    sub: req.auth.sub,
    email: req.auth.email,
  };

  next();
};

// EXPORT BOTH CORRECTLY
module.exports = {
  checkJwt,
  attachUser,
};