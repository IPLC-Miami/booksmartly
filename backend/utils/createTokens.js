const jwt = require("jsonwebtoken");

const createTokens = (user) => {
  const refreshToken = jwt.sign(
    { userId: user.id, count: user.tokenCount },
    process.env.JWT_REFRESH_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET_KEY,
    {
      expiresIn: "15min",
    }
  );

  return { refreshToken, accessToken };
};

module.exports = createTokens;