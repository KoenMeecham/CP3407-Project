const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const checkJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const attachUser = (req, res, next) => {
  next();
};

module.exports = {
  checkJwt,
  attachUser,
};