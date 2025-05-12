import { REDIS_AUTH_TOKEN_SESSION } from 'src/providers/redis/redis.constant';
import { envConfig } from './env.config';
import RedisStore from 'connect-redis';

import { RedisService } from '@providers/redis/redis.service';

export const sessionConfig = () => {
  const redisClient = new RedisService().client;
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'SEQ:',
  });
  return {
    store: redisStore,
    name: REDIS_AUTH_TOKEN_SESSION,
    secret: envConfig().secret,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 1000 * 60 * 60 * 24 * 30, // 60 days --> need >= max of alive time of refresh token
    // },
  };
};
