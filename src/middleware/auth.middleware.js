const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  try {
  
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    
    const token = authHeader.replace("Bearer ", "");

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
