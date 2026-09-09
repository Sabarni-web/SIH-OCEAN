import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

// Create Redis client
export const redisClient = createClient(
  redisUrl ? { url: redisUrl } : {}
);

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Initialize connection
(async () => {
  if (redisUrl) {
    try {
      await redisClient.connect();
    } catch (e) {
      console.error('Failed to connect to Redis:', e);
    }
  } else {
    console.warn('REDIS_URL is not set. Caching will be disabled.');
  }
})();

/**
 * Get a value from Redis cache
 */
export const getCache = async (key: string): Promise<any | null> => {
  if (!redisClient.isReady) return null;
  
  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
  }
  return null;
};

/**
 * Set a value in Redis cache with expiry (default 3600s = 1 hour)
 */
export const setCache = async (key: string, value: any, expirySeconds = 3600): Promise<void> => {
  if (!redisClient.isReady) return;
  
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.setEx(key, expirySeconds, stringValue);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};
