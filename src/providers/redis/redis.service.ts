import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private _redisClient;
  constructor() {
    this._redisClient = createClient();
    this._redisClient.connect().catch(console.error);
  }
  get client() {
    return this._redisClient;
  }
}
