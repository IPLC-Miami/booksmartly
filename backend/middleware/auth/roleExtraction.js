const roleExtraction = (req, res, next) => {
  if (req.userRole) {
    return next();
  }
  return res.sendStatus(403);
};

module.exports = { roleExtraction };