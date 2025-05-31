// import Redis from "ioredis";
const Redis = require("ioredis");

let redis = null;
let isRedisAvailable = false;

// Check if Redis URL is provided
if (process.env.UPSTASH_REDIS_REST_URL) {
  try {
    redis = new Redis(process.env.UPSTASH_REDIS_REST_URL);
    isRedisAvailable = true;
    
    redis.on("connect", () => console.log("✅ Connected to Upstash Redis!"));
    redis.on("error", (err) => {
      console.error("❌ Redis Connection Error:", err);
      isRedisAvailable = false;
    });
  } catch (error) {
    console.error("❌ Redis Setup Error:", error);
    isRedisAvailable = false;
  }
} else {
  console.log("⚠️ Redis not configured - running without caching");
}

// Function to set a key-value pair in Redis (graceful fallback)
const setCache = async (key, value, expiry = 3600) => {
  if (!isRedisAvailable || !redis) {
    console.log("⚠️ Redis unavailable - skipping cache set for:", key);
    return;
  }
  
  try {
    await redis.set(key, JSON.stringify(value), "EX", expiry);
    console.log("✅ Cached:", key);
  } catch (error) {
    console.error("❌ Redis Set Error:", error);
    isRedisAvailable = false;
  }
};

// Function to get a value from Redis (graceful fallback)
const getCache = async (key) => {
  if (!isRedisAvailable || !redis) {
    console.log("⚠️ Redis unavailable - skipping cache get for:", key);
    return null;
  }
  
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Redis Get Error:", error);
    isRedisAvailable = false;
    return null;
  }
};

module.exports = { redis, setCache, getCache, isRedisAvailable };
