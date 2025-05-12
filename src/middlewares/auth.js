// middlewares/auth.js
const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    // payload phải chứa userId khi bạn generate token lúc signin
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: invalid token" });
  }
}
module.exports = { authenticateJWT };
