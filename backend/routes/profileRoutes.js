const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const multer = require("multer");
const upload = multer();
//pushing new profile picture
router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("req to upload profile pic recieved", req.body);
  const { userId } = req.body;
  console.log("req.body:", req.body);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const avatar_url = `avatars/${userId}/${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(`avatars`)
    .remove([`avatars/${userId}/${file.originalname}`]);

  if (error) {
    if (error.message.includes("Object not found")) {
      console.log("File does not exist.");
    } else {
      console.error("Error deleting file:", error);
    }
  } else {
    if (data.length === 0) {
      console.log("File does not exist or was already deleted.");
    } else {
      console.log("File deleted successfully");
    }
  }
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`avatars/${userId}/${file.originalname}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error uploading file to Supabase storage:", error);
      return res.status(400).json({ error: error.message });
    }

    if (error) {
      console.error("Error uploading file to Supabase storage:", error);
      return res.status(400).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars") // Change 'avatars' to your actual bucket name
      .getPublicUrl(avatar_url);
    console.log("publicurldata ", publicUrlData);
    const { data: profileData, error: reportError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrlData.publicUrl,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (reportError) {
      console.log(reportError);
      return res.status(400).json({ error: reportError.message });
    }

    res.status(201).json(profileData);
    console.log("profile picture uploaded successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while uploading file" });
  }
});

module.exports = router;

