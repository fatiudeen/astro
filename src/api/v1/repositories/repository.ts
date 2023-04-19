/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
import { OPTIONS } from '@config';
import redis from '@helpers/redis';
import { Model, Query, Types } from 'mongoose';

export default abstract class Repository<T> {
  protected abstract model: Model<T>;
  protected useRedis = OPTIONS.USE_REDIS;
  protected cacheClient = redis;

  optionsParser<Q extends Query<any, any>>(q: Q, options: OptionsParser<T>): Q {
    if (options.sort) {
      q.sort(<Record<Partial<keyof DocType<T>>, 1 | -1>>options.sort);
    }

    if (options.limit) {
      q.limit(options.limit);
    }

    if (options.skip) {
      q.skip(options.skip);
    }

    if (options.projection && options.projection.length > 0) {
      q.projection(options.projection.join(' '));
    }

    if (options.populate) {
      Array.isArray(options.populate) ? q.populate(options.populate.join(' ')) : q.populate(options.populate);
    }

    if (options.and && options.and.length > 0) {
      q.and(options.and);
    }

    if (options.or && options.or.length > 0) {
      q.or(options.or);
    }

    if (options.in) {
      q.where(options.in.query).in(options.in.in);
    }

    if (options.all) {
      q.where(options.all.query).all(options.all.all);
    }

    return q;
  }

  find(
    _query?: Partial<T> | Array<string> | { [K in keyof DocType<T>]?: Array<DocType<T>[K]> },
    options: OptionsParser<T> | undefined = undefined,
  ) {
    return new Promise<DocType<T>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => new Types.ObjectId(val)) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
        }
      let key: string;
      // if (this.useRedis) {
      //   key = JSON.stringify({
      //     ...query,
      //     collection: this.model.name,
      //   });
      //   this.cacheClient!.get(key).then((cacheValue) => {
      //     if (cacheValue) resolve(<DocType<T>[]>JSON.parse(cacheValue));
      //   });
      // }
      const q = options ? this.optionsParser(this.model.find(query), options) : this.model.find(query);
      // if (options){

      // }
      q.lean()
        .then((r) => {
          if (this.useRedis) {
            this.cacheClient!.set(key, JSON.stringify(r));
          }
          resolve(<DocType<T>[]>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(query: string | Partial<T>) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      let key: string;
      if (this.useRedis) {
        key =
          typeof query === 'object'
            ? JSON.stringify({
                ...query,
                collection: this.model.name,
              })
            : query;
        this.cacheClient!.get(key).then((cacheValue) => {
          if (cacheValue) resolve(<DocType<T>>JSON.parse(cacheValue));
        });
      }
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }
          if (this.useRedis) {
            this.cacheClient!.set(key, JSON.stringify(r));
          }
          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  update(
    query: string | Partial<T>,
    data: Partial<T> & {
      load?: { key: string; value: any | any[]; toSet?: boolean };
      unload?: { key: string; value: string | string[]; field?: string };
      increment?: { key: keyof T; value: number };
    },
    upsert = false,
    many = false,
  ) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true, upsert: false };
      if (upsert) {
        options.upsert = true;
      }

      // const _data = { ...data.set };
      if (data.load) {
        const push = data.load.toSet ? '$addToSet' : '$push';
        const _key = data.load.key;
        if (Array.isArray(data.load.value)) {
          Object.assign(data, {
            [push]: {
              [_key]: {
                $each: data.load.value,
              },
            },
          });
        } else {
          Object.assign(data, {
            [push]: {
              [_key]: data.load.value,
            },
          });
        }
        delete data.load;
      }

      if (data.unload) {
        const _key = data.unload.key;
        const _field = data.unload.field || '_id';
        if (Array.isArray(data.unload.value)) {
          Object.assign(data, {
            $pull: {
              [_key]: {
                [_field]: { $in: data.unload.value },
              },
            },
          });
        } else {
          Object.assign(data, {
            $pull: {
              [_key]: {
                [_field]: data.unload.value,
              },
            },
          });
        }
        delete data.unload;
      }

      if (data.increment) {
        const _key = data.increment.key;
        Object.assign(data, {
          $inc: {
            [_key]: data.increment.value,
          },
        });
        delete data.increment;
      }
      const q =
        typeof query === 'object'
          ? many
            ? this.model.updateMany(query, data, options)
            : this.model.findOneAndUpdate(query, data, options)
          : this.model.findByIdAndUpdate(query, data, options);
      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }
          if (this.useRedis) {
            const key =
              typeof query === 'object'
                ? JSON.stringify({
                    ...query,
                    collection: this.model.name,
                  })
                : query;
            this.cacheClient!.set(key, JSON.stringify(r));
          }
          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  create(data: Partial<T>) {
    return new Promise<DocType<T>>((resolve, reject) => {
      this.model
        .create(data)
        .then((user) => {
          resolve(user.toObject());
        })
        .catch((e) => reject(e));
    });
  }

  delete(query: string | Partial<T>) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true };

      const q =
        typeof query === 'object'
          ? this.model.findOneAndDelete(query, options)
          : this.model.findByIdAndDelete(query, options);
      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }
          if (this.useRedis) {
            const key =
              typeof query === 'object'
                ? JSON.stringify({
                    ...query,
                    collection: this.model.name,
                  })
                : query;
            this.cacheClient!.get(key).then((doc) => {
              if (doc) this.cacheClient!.del(key);
            });
          }
          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  count(query: Partial<T> = {}) {
    return this.model.countDocuments(query);
  }
}
