/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
import { OPTIONS } from '@config';
import redis from '@helpers/redis';
import { Model, Query } from 'mongoose';

type PopulateType = {
  path: string;
  model: string;
  select?: string;
  populate?: PopulateType | PopulateType[];
};

type OptionsParser<T> = {
  sort?: Record<Partial<keyof DocType<T>>, 1 | -1>;
  limit?: number;
  projection?: [keyof DocType<T>];
  populate?: [keyof DocType<T>] | PopulateType;
};

export default abstract class Repository<T> {
  protected abstract model: Model<T>;
  protected useRedis = OPTIONS.USE_REDIS;
  protected cacheClient = redis;

  optionsParser<Q extends Query<any, any>>(q: Q, options: OptionsParser<T>): Q {
    if (options.sort) {
      q.sort(options.sort);
    }

    if (options.limit) {
      q.limit(options.limit);
    }

    if (options.projection && options.projection.length > 1) {
      q.projection(options.projection.join(' '));
    }

    if (options.populate) {
      Array.isArray(options.populate) ? q.populate(options.populate.join(' ')) : q.populate(options.populate);
    }
    return q;
  }

  protected paginatedFind(query?: Partial<T & { page?: number | string; limit?: number | string }>) {
    return new Promise<{
      data: DocType<T>[];
      limit: number;
      totalDocs: number;
      page: number;
      totalPages: number;
    }>((resolve, reject) => {
      let key: string;
      query = query || {};
      if (this.useRedis) {
        key = JSON.stringify({
          ...query,
          collection: this.model.name,
        });
        this.cacheClient!.get(key).then((cacheValue) => {
          if (cacheValue) {
            resolve(
              <
                {
                  data: DocType<T>[];
                  limit: number;
                  totalDocs: number;
                  page: number;
                  totalPages: number;
                }
              >JSON.parse(cacheValue),
            );
          }
        });
      }
      let page: number = 1;
      let limit: number = 10;
      if (query?.page) {
        typeof query.page === 'string'
          ? ((page = parseInt(query.page, 10)), delete query.page)
          : (query.page, delete query.page);
      }
      if (query?.limit) {
        typeof query.limit === 'string'
          ? ((limit = parseInt(query.limit, 10)), delete query.limit)
          : (query.limit, delete query.limit);
      }
      query = Object.entries(query).length > 1 ? query : {};
      const startIndex = limit * (page - 1);
      let totalDocs = 0;
      this.count()
        .then((_totalDocs) => {
          totalDocs = _totalDocs;
          return this.model
            .find(<Partial<T>>query)
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit)
            .lean();
        })
        .then((data) => {
          const totalPages = Math.floor(totalDocs / limit) + 1;
          const result = {
            data: <DocType<T>[]>data,
            limit,
            totalDocs,
            page,
            totalPages,
          };
          if (this.useRedis) {
            this.cacheClient!.set(key, JSON.stringify(result));
          }
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  find(
    query?: Partial<T & { page?: number | string; limit?: number | string }>,
    paginate = false,
    options: OptionsParser<T> | undefined = undefined,
  ) {
    return paginate
      ? this.paginatedFind(query)
      : new Promise<DocType<T>[]>((resolve, reject) => {
          query = query || {};
          let key: string;
          if (this.useRedis) {
            key = JSON.stringify({
              ...query,
              collection: this.model.name,
            });
            this.cacheClient!.get(key).then((cacheValue) => {
              if (cacheValue) resolve(<DocType<T>[]>JSON.parse(cacheValue));
            });
          }
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
