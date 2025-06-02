const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

let redis;
let redisAvailable = false;

if (process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    tls: false, // Binding to localhost only, so TLS is not needed
    maxRetriesPerRequest: 3, // Optional: Limit retries
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000); // delay between 50ms and 2s
      return delay;
    },
    enableOfflineQueue: false, // Don't queue commands if Redis is offline
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
    redisAvailable = true;
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    // console.error('Redis connection error:', err); // Full error for debugging if needed
    redisAvailable = false;
    // Note: We are not re-throwing the error here to allow the app to continue without Redis if it's unavailable.
    // The getCache and setCache functions will handle the unavailability.
  });

  redis.on('end', () => {
    console.log('Redis connection ended');
    redisAvailable = false;
  });

} else {
  console.warn('⚠️ Redis not configured - running without caching. Please set REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD in your .env file.');
}

// Helper function to get data from cache
async function getCache(key) {
  if (!redisAvailable || !redis) {
    console.warn(`⚠️ Redis unavailable - skipping cache get for: ${key}`);
    return null;
  }
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err.message);
    return null; // Fallback to no cache on error
  }
}

// Helper function to set data in cache
async function setCache(key, value, ttlSeconds = 60) {
  if (!redisAvailable || !redis) {
    console.warn(`⚠️ Redis unavailable - skipping cache set for: ${key}`);
    return;
  }
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err.message);
    // Do not throw, allow app to continue
  }
}

module.exports = {
  redis: redisAvailable ? redis : null, // Export redis client only if available
  getCache,
  setCache,
  isRedisAvailable: () => redisAvailable,
};
