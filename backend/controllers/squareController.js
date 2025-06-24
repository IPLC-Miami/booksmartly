const getSquareEnv = (req, res) => {
  try {
    const squareMode = process.env.SQUARE_MODE || 'sandbox';
    res.json({ env: squareMode });
  } catch (error) {
    console.error('Error getting Square environment:', error);
    res.status(500).json({ error: 'Failed to get Square environment' });
  }
};

module.exports = {
  getSquareEnv
};