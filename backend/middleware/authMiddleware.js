const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get header
    const authHeader = req.headers.authorization;

    // 2. Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 3. Extract token (Bearer TOKEN)
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    // 5. Attach user data
    req.user = decoded;

    // 6. Allow request
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;