const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/consult", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const now = new Date();
  const hour = now.getHours();
  let greeting;
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  const systemPrompt = `
You are an AI assistant for BookSmartly, here to help with questions related to speech and language pathology and occupational therapy. Please use English unless the user specifies another language. When responding:
- Begin with a time-appropriate greeting: "${greeting},"
- Be Professional while talking to patients (and be respectful)
- Provide concise (20–30 words), evidence-based medical advice in a calm, reassuring tone.
- If the user's query is not medical, reply: "Sorry that is not in my domain."
Patient says: "${prompt}"
`.trim();

  console.log("hit /consult");

  try {
    // Call Gemini AI
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;
    const geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}`,
              },
            ],
          },
        ],
      }),
    });
    
    if (!geminiResp.ok) {
      const txt = await geminiResp.text();
      throw new Error(`Gemini API error: ${txt}`);
    }
    
    const geminiData = await geminiResp.json();
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!replyText) throw new Error("No reply from Gemini");
    
    console.log("AI reply:", replyText);

    // Return only the text response - no audio functionality
    res.json({
      replyText,
    });
  } catch (err) {
    console.error("Error in /consult:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
