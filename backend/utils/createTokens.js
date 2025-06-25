const jwt = require("jsonwebtoken");

const createTokens = (user) => {
  const refreshToken = jwt.sign(
    { userId: user.id, count: user.count },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
  const accessToken = jwt.sign(
    { userId: user.id, count: user.count },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15min",
    }
  );

  return { refreshToken, accessToken };
};

module.exports = createTokens;