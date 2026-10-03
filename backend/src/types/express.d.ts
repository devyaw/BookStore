import type { Redis } from "ioredis"; // or: import type { RedisClientType } from "redis";

declare global {
  namespace Express {
    interface Request {
      redisClient: Redis; // no "?" so it's not optional
    }
  }
}

export {};
