import { REDIS_URL } from '$env/static/private';
import Redis from 'ioredis';

// Create a singleton Redis instance
// This ensures we don't open too many connections in serverless environments
// where the container might be reused.
export const redis = new Redis(REDIS_URL);
