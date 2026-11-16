const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

function generateToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: process.env.JWT_ISSUER || "richu-api",
      audience: process.env.JWT_AUDIENCE || "richu-web",
      jwtid: randomUUID()
    }
  );
}

module.exports = generateToken;
