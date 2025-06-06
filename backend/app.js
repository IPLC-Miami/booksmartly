const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
// const https = require("https");
const http = require("http");
const cookieParser = require("cookie-parser");
dotenv.config();
const { oauth2client, refreshAccessToken } = require("./config/googleClient");
require("./services/cronJob.js");
const { redis, setCache, getCache } = require("./config/redisClient.js");
const { initSocket } = require("./config/socket"); // import your socket module

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const clinicianRoutes = require("./routes/clinicianRoutes"); // Updated
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const testReportsRoutes = require("./routes/testReportsRoutes");
const clinicianProfileRoutes = require("./routes/clinicianProfileRoutes"); // Updated
const receptionProfileRoutes = require("./routes/receptionProfileRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes");
const healthWorkerRoutes = require("./routes/healthWorkerRoutes.js");
const AiConsultation = require("./routes/AiConsultation.js");
const fileRoutes = require("./routes/fileRoutes");
const chatRoutes = require("./routes/chatRoutes");
const billingRoutes = require("./routes/billingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// connectDB();
const profileRoutes = require("./routes/profileRoutes");
const multiClinicianDashboardRoutes = require("./routes/multiClinicianDashboardRoutes"); // Updated
// const {getAuthUrl , getAuthToken} = require("./config/googleClient");
// const {oauth2client} = require("./config/googleClient");
const cors = require("cors");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
// const fs = require("fs");
// connectDB();

const app = express();

const server = http.createServer(app);

initSocket(server);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use("/AiConsultation", AiConsultation);

app.use(async (req, res, next) => {
  try {
    // Only attempt Google token refresh if we have credentials
    if (oauth2client.credentials && oauth2client.credentials.access_token) {
      const tokenExpiryTime = oauth2client.credentials.expiry_date;
      const currentTime = Date.now();
      if (!tokenExpiryTime || tokenExpiryTime < currentTime) {
        console.log("Google access token expired, refreshing...");
        await refreshAccessToken();
      }
    }
    // If no Google credentials, silently continue (Google Calendar is optional)
    next();
  } catch (error) {
    console.error("Error checking or refreshing Google token:", error.message);
    // Don't fail the request for Google token issues - just log and continue
    next();
  }
});
// Routes
app.get("/", (req, res) => res.send("Hello World"));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/users", userRoutes); // ADD: Mount userRoutes under /api/users to match frontend expectations
app.use("/clinicians", clinicianRoutes); // Updated
app.use("/appointments", appointmentRoutes);
app.use("/api/appointments", appointmentRoutes); // ADD: Mount appointmentRoutes under /api/appointments to match frontend expectations
app.use("/prescriptions", prescriptionRoutes);
app.use("/testReports", testReportsRoutes);
app.use("/uploadProfiles", profileRoutes);
app.use("/clinicianProfileRoutes", clinicianProfileRoutes); // Updated
app.use("/receptionProfileRoutes", receptionProfileRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/multiClinicianDashboardRoutes", multiClinicianDashboardRoutes); // Updated
app.use("/healthWorkerRoutes", healthWorkerRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/analytics", analyticsRoutes);

// const options = {
//   key: fs.readFileSync("certs/key.pem"),
//   cert: fs.readFileSync("certs/cert.pem"),
// };
app.get("/keepalive", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.get("/auth/google", (req, res) => {
  const url = oauth2client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.redirect(url);
});
app.get("/auth/redirect", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send("No authorization code provided.");
    }
    const tokens = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);
    // const TOKEN_PATH = 'token.json';
    // fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    // console.log("Token saved to", TOKEN_PATH);
    res.send("Google authentication successful!");
  } catch (e) {
    console.error("Error authenticating with Google:", e);
    if (!res.headersSent) res.status(500).send("Authentication failed.");
  }
});

// app.get("/auth/redirect", async (req, res) => {
//     const code = req.query.code;
//     if (!code) {
//         return res.status(400).send("No authorization code provided.");
//     }

//     try {
//         const tokens = await getAuthToken(code);
//         res.json({ message: "Google authentication successful!", tokens });
//     } catch (error) {
//         console.error("Error authenticating with Google:", error);
//         res.status(500).send("Authentication failed.");
//     }
// });

(async () => {
  await setCache("go", "goa");
  const value = await getCache("go");
  console.log("Cached value:", value);
})();

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

// https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on https://localhost:${PORT}`);
// });

