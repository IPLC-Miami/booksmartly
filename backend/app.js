const express = require("express");
const fs = require("fs");
// const https = require("https");
const http = require("http");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const RedisStore = require("connect-redis");

// Import cache management utility for persistent module caching fix
const {
  purgeAllDevelopmentCache,
  setupDevelopmentWatchers
} = require("./utils/cacheManager");

// Purge all cached modules at startup to prevent persistent caching issues
console.log("🚀 Starting BookSmartly Backend Server...");
if (process.env.NODE_ENV !== 'production') {
  console.log("🧹 Development mode: Purging all cached modules...");
  purgeAllDevelopmentCache();
  
  // Set up file watchers for automatic cache invalidation
  setupDevelopmentWatchers();
}

const { oauth2client, refreshAccessToken } = require("./config/googleClient");
require("./services/cronJob.js");
const { redis, setCache, getCache } = require("./config/redisClient.js");
const { initSocket } = require("./config/socket"); // import your socket module
const passport = require('./services/auth');

// Available routes
const authRoutes = require("./routes/auth");
const squareRoutes = require("./routes/square");

// TODO: Re-enable these routes when files are created
// const userRoutes = require("./routes/userRoutes");
// const clinicianRoutes = require("./routes/clinicianRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");
// const prescriptionRoutes = require("./routes/prescriptionRoutes");
// const testReportsRoutes = require("./routes/testReportsRoutes");
// const clinicianProfileRoutes = require("./routes/clinicianProfileRoutes");
// const receptionProfileRoutes = require("./routes/receptionProfileRoutes.js");
// const feedbackRoutes = require("./routes/feedbackRoutes");
// const healthWorkerRoutes = require("./routes/healthWorkerRoutes.js");
// const AiConsultation = require("./routes/AiConsultation.js");
// const fileRoutes = require("./routes/fileRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const billingRoutes = require("./routes/billingRoutes");
// const analyticsRoutes = require("./routes/analyticsRoutes");
// const scheduleRoutes = require("./routes/scheduleRoutes");
// const profileRoutes = require("./routes/profileRoutes");
// const multiClinicianDashboardRoutes = require("./routes/multiClinicianDashboardRoutes");
// const {getAuthUrl , getAuthToken} = require("./config/googleClient");
// const {oauth2client} = require("./config/googleClient");
const cors = require("cors");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware.js");
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

// Security headers middleware
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https: https://static.vecteezy.com; " +
    "connect-src 'self' https://api.iplcmiami.com wss://booksmartly.iplcmiami.com https://maps.googleapis.com https://*.squarecdn.com https://www.google-analytics.com; " +
    "frame-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Configure session store with Redis fallback to MemoryStore
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'booksmartly-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.iplcmiami.com' : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use Redis store if available, otherwise fallback to MemoryStore
if (redis) {
  console.log('✅ Using Redis session store');
  sessionConfig.store = new RedisStore({
    client: redis,
    prefix: 'booksmartly:sess:'
  });
} else {
  console.warn('⚠️ Using MemoryStore for sessions - not recommended for production');
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// TODO: Re-enable when AiConsultation route is available
// app.use("/AiConsultation", AiConsultation);

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

// Available routes
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/integrations/square", squareRoutes);

// TODO: Re-enable these routes when files are created
// app.use("/users", userRoutes);
// app.use("/api/users", userRoutes);
// app.use("/clinicians", clinicianRoutes);
// app.use("/api/clinicians", clinicianRoutes);
// app.use("/appointments", appointmentRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/prescriptions", prescriptionRoutes);
// app.use("/testReports", testReportsRoutes);
// app.use("/uploadProfiles", profileRoutes);
// app.use("/clinicianProfileRoutes", clinicianProfileRoutes);
// app.use("/receptionProfileRoutes", receptionProfileRoutes);
// app.use("/api/receptionProfileRoutes", receptionProfileRoutes);
// app.use("/feedback", feedbackRoutes);
// app.use("/multiClinicianDashboardRoutes", multiClinicianDashboardRoutes);
// app.use("/healthWorkerRoutes", healthWorkerRoutes);
// app.use("/api/files", fileRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/billing", billingRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/schedules", scheduleRoutes);

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

// Cache test removed - was causing startup crashes when Redis not immediately available
// Cache functionality is tested through normal application usage

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for unmatched routes (must be AFTER all route definitions)
app.use(notFoundHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

// https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on https://localhost:${PORT}`);
// });

