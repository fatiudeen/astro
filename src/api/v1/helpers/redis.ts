import { OPTIONS, REDIS_URI } from '@config';
import { logger } from '@utils/logger';
import { createClient } from 'redis';

class Redis {
  client;
  timeOut;
  constructor(timeOut?: number) {
    this.timeOut = timeOut || null;
    const client = createClient({ url: REDIS_URI });

    client.on('error', (err) => logger.error(['Redis Client Error', err]));
    client.connect().then();
    this.client = client;
  }

  set(key: string, val: string) {
    const set = this.timeOut ? this.client.set(key, val, { EX: this.timeOut }) : this.client.set(key, val);
    set.then();
  }

  async get(key: string) {
    const val = await this.client.get(key);
    if (typeof val === 'string') {
      return JSON.stringify(val);
    }
  }
  get keys() {
    return this.client.keys;
  }

  invalidateCache(key: string) {
    this.client
      ?.keys(`*${key}*`)
      .then((keys) => {
        const multi = this.client.multi();
        keys.forEach((k) => multi.del(k));
        return multi?.exec();
      })
      .then();
  }
}

export default OPTIONS.USE_REDIS ? new Redis() : null;
