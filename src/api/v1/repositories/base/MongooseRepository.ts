import { ClientSession, startSession, Model, Query, Types, model } from 'mongoose';
import { RepositoryInterface, UpdateData } from './Repository.Interface';

export abstract class MongooseRepository<T> implements RepositoryInterface<T> {
  protected abstract model: Model<T>;

  find(
    _query?: Partial<T> | Array<string> | { [K in keyof DocType<T>]?: Array<DocType<T>[K]> },
    options?: OptionsParser<T>,
    session: ClientSession | null = null,
  ) {
    return new Promise<DocType<T>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => new Types.ObjectId(val)) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
        }

      const q = options ? this.optionsParser(this.model.find(query), options) : this.model.find(query);
      q.session(session)
        .lean()
        .then((r) => {
          resolve(<DocType<T>[]>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(query: string | Partial<T>, session: ClientSession | null = null) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.session(session)
        .lean()
        .then((r) => {
          if (!r) {
            resolve(null);
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
    data: UpdateData<T>,
    upsert = false,
    many = false,
    session: ClientSession | undefined = undefined,
  ) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true, upsert: false };
      if (upsert) {
        options.upsert = true;
      }

      if (session) {
        Object.assign(options, { session });
      }

      this.handleLoad(data);
      this.handleUnload(data);
      this.handleIncrement(data);

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
          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  create<D extends Partial<T> | Array<Partial<T>>, R>(
    data: D,
    session: D extends Array<Partial<T>> ? ClientSession | undefined : never,
  ) {
    const options = {};
    if (session) {
      Object.assign(options, { session });
    }
    return new Promise<D extends Array<Partial<T>> ? Array<DocType<T>> : DocType<T>>((resolve, reject) => {
      const q = Array.isArray(data) ? this.model.create(data, options) : this.model.create(data);

      q.then((user) => {
        const result = Array.isArray(user) ? user.map((u) => u.toObject()) : user.toObject();
        resolve(<D extends Array<Partial<T>> ? Array<DocType<T>> : DocType<T>>result);
      }).catch((e) => reject(e));
    });
  }

  delete(query: string | Partial<T>, session: ClientSession | undefined = undefined) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true };

      if (session) {
        Object.assign(options, { session });
      }

      const q =
        typeof query === 'object'
          ? this.model.findOneAndDelete(query, options)
          : this.model.findByIdAndDelete(query, options);
      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
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

  private optionsParser<Q extends Query<any, any>>(q: Q, options: OptionsParser<T>): Q {
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

  private handleLoad(data: UpdateData<T>) {
    if (data.load) {
      const push = data.load.toSet ? '$addToSet' : '$push';
      Object.entries(data.load.data).forEach(([_key, value]) => {
        if (Array.isArray(value)) {
          Object.assign(data, {
            [push]: {
              [_key]: {
                $each: value,
              },
            },
          });
        } else {
          Object.assign(data, {
            [push]: {
              [_key]: value,
            },
          });
        }
      });

      delete data.load;
    }
  }
  private handleUnload(data: UpdateData<T>) {
    if (data.unload) {
      const _field = data.unload.field ?? '_id';
      Object.entries(data.unload.data).forEach(([_key, value]) => {
        if (Array.isArray(value)) {
          Object.assign(data, {
            $pull: {
              [_key]: _field
                ? {
                    [_field]: { $in: value },
                  }
                : { $in: value },
            },
          });
        } else {
          Object.assign(data, {
            $pull: {
              [_key]: _field
                ? {
                    [_field]: value,
                  }
                : value,
            },
          });
        }
      });

      delete data.unload;
    }
  }

  private handleIncrement(data: UpdateData<T>) {
    if (data.increment) {
      const _key = data.increment.key;
      Object.assign(data, {
        $inc: {
          [_key]: data.increment.value,
        },
      });
      delete data.increment;
    }
  }

  get startSession() {
    return startSession;
  }
}
