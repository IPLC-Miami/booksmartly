const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

const verifyToken = async (req, res, next) => {
  // console.log(req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  // console.log("in verify token", token);
  // console.log("in access token");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    req.user = user; // Attach user info to request
    next(); // Proceed to next middleware or route
  } catch (error) {
    res.status(500).json({ error: "Server error verifying token" });
  }
};
module.exports = verifyToken;

