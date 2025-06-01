const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const verifyToken = require("../config/verifyToken");
const { getCache, setCache } = require("../config/redisClient");
const { encrypt } = require("../services/encrypt");

const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

router.get(
  "/getReceptionDetailsById/:userId",
  verifyToken,
  async (req, res) => {
    try {
      console.time("API Call Time");
      console.log("Request body:", req.params);

      const userId = req.params.userId; // Corrected destructuring
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      console.log("Fetching details for userId:", userId);

      const dataDetails = await getCache(`receptionProfileDetails:${userId}`);
      if (dataDetails) {
        const parsedData = JSON.parse(dataDetails);
        console.log("Returning cached data:", dataDetails);
        console.timeEnd("API Call Time");
        return res.json(parsedData); // Return cached data
      }

      const { data: profile, error: profileError } = await supabase
        .from("receptions") // Changed 'reception' to 'receptions'
        .select("*")
        .eq("id", userId) // Assuming userId param is receptions.id
        .single();
      if (profileError) {
        console.error("Supabase error fetching reception details:", profileError.message);
        return res.status(500).json({
          error: "Reception Profile fetch failed", // Updated error message
          details: profileError.message,
        });
      }
      const data1 = { profile };
      //   console.log({ profile });
      var data = console.timeEnd("API Call Time");
      setCache(
        //setting cache in redis for 3 days
        `receptionProfileDetails:${userId}`,
        JSON.stringify(data1),
        259200000
      );
      return res.json({ profile });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/generate-qr/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Create a payload containing minimal details needed for validation
    const payload = {
      userId: userId,
      createdAt: new Date().toISOString(),
      // Expires 10 minutes from now
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    // Convert payload to string and encrypt it
    const payloadStr = JSON.stringify(payload);
    const encryptedCode = encrypt(payloadStr);

    // Store the encrypted code in the receptions table
    const { data, error } = await supabase
      .from("receptions") // Changed 'reception' to 'receptions'
      .update({ qrcode: encryptedCode })
      .eq("id", userId); // Assuming userId param is receptions.id

    if (error) {
      console.error("Supabase error updating reception qrcode:", error);
      return res
        .status(500)
        .json({ error: "Error storing QR code", details: error.message });
    }

    // Return the encrypted QR code data
    return res.json({ encryptedCode });
  } catch (err) {
    console.error("Error generating QR code:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

