const express = require("express");
const router = express.Router();

// NOTE: All supabase logic has been removed.
// TODO: Re-implement with Mongoose models.

router.post("/add/:id", async (req, res) => {
  res.status(501).json({ message: "Not Implemented" });
});

module.exports = router;

