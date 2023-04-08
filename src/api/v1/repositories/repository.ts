import { Model, Types } from 'mongoose';

export default abstract class Repository<T> {
  protected abstract model: Model<T>;

  find(query?: Partial<T>) {
    const doc = query || {};
    return this.model.find(doc);
  }

  findOne(query: string | Partial<T>) {
    if (typeof query === 'object') return this.model.findOne(query);
    return this.model.findById(query);
  }

  update(query: string | Partial<T>, data: Partial<T>) {
    if (typeof query === 'object') return this.model.findOneAndUpdate(query, data, { new: true });
    return this.model.findByIdAndUpdate(query, data, { new: true });
  }

  upsert(query: string | Partial<T>, data: Partial<T>) {
    if (typeof query === 'object') {
      return this.model.findOneAndUpdate(query, data, { new: true, upsert: true });
    }
    return this.model.findByIdAndUpdate(query, data, { new: true, upsert: true });
  }

  updateMany(query: Partial<T>, data: Partial<T>) {
    return this.model.updateMany(query, data);
  }

  create(data: Partial<T>) {
    return this.model.create(data);
  }

  delete(query: string | Partial<T>) {
    if (typeof query === 'object') return this.model.findOneAndDelete(query, { new: true });
    return this.model.findByIdAndDelete(query, { new: true });
  }

  load(id: string, key: string, value: any | any[]) {
    if (Array.isArray(value)) {
      return this.model.findByIdAndUpdate(id, { $push: { key: { $each: value } } }, { new: true });
    }
    return this.model.findByIdAndUpdate(id, { $push: { key: value } }, { new: true });
  }

  unload(id: string, data: Record<string, Record<'_id', string | Record<'$in', string[]>>>) {
    return this.model.findByIdAndUpdate(id, { $pull: data }, { new: true });
  }

  increment(id: string | Types.ObjectId, data: Record<keyof T, number>) {
    return this.model.findByIdAndUpdate(id, { $inc: data }, { new: true });
  }

  /**
   * handles complex update queries
   */
  complex(query: object, data: object, options: object = { new: true }) {
    return this.model.findOneAndUpdate(query, data, options);
  }
  count(query: Partial<T> = {}) {
    return this.model.countDocuments(query);
  }
}
