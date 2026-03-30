const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const checkJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // This contains id, email, and role from your login route
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const attachUser = (req, res, next) => {
  // Since checkJwt already attaches the user to req.user, 
  // this middleware can ensure the user object is properly formatted for your routes
  if (req.user) {
    // Mapping internal 'id' from token back to 'user_id' if your routes expect that
    req.user.user_id = req.user.id; 
  }
  next();
};

module.exports = { checkJwt, attachUser };