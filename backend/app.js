const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
// const https = require("https");
const http = require("http");
dotenv.config();
const { oauth2client, refreshAccessToken } = require("./config/googleClient");
require("./services/cronJob.js");
const { redis, setCache, getCache } = require("./config/redisClient.js");
const { initSocket } = require("./config/socket"); // import your socket module

const userRoutes = require("./routes/userRoutes");
const clinicianRoutes = require("./routes/clinicianRoutes"); // Updated
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const testReportsRoutes = require("./routes/testReportsRoutes");
const clinicianProfileRoutes = require("./routes/clinicianProfileRoutes"); // Updated
const receptionProfileRoutes = require("./routes/receptionProfileRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes");
const healthWorkerRoutes = require("./routes/healthWorkerRoutes.js");
const AiConsultation = require("./routes/AiConsultation.js");

// connectDB();
const profileRoutes = require("./routes/profileRoutes");
const multiClinicianDashboardRoutes = require("./routes/multiClinicianDashboardRoutes"); // Updated
// const {getAuthUrl , getAuthToken} = require("./config/googleClient");
// const {oauth2client} = require("./config/googleClient");
const cors = require("cors");
// const fs = require("fs");
// connectDB();

const app = express();

const server = http.createServer(app);

initSocket(server);

app.use(cors());

app.use(express.json());
app.use("/AiConsultation", AiConsultation);

app.use(async (req, res, next) => {
  try {
    const tokenExpiryTime = oauth2client.credentials.expiry_date;
    const currentTime = Date.now();
    if (!tokenExpiryTime || tokenExpiryTime < currentTime) {
      console.log("Access token expired, refreshing...");
      await refreshAccessToken();
    }
    next();
  } catch (error) {
    console.error("Error checking or refreshing token:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
});
// Routes
app.get("/", (req, res) => res.send("Hello World"));

app.use("/users", userRoutes);
app.use("/clinicians", clinicianRoutes); // Updated
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/testReports", testReportsRoutes);
app.use("/uploadProfiles", profileRoutes);
app.use("/clinicianProfileRoutes", clinicianProfileRoutes); // Updated
app.use("/receptionProfileRoutes", receptionProfileRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/multiClinicianDashboardRoutes", multiClinicianDashboardRoutes); // Updated
app.use("/healthWorkerRoutes", healthWorkerRoutes);

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

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

// https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on https://localhost:${PORT}`);
// });

