/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import Repository from '@repositories/repository';
import observer from '@helpers/observer';
// single model methods
export default abstract class Service<T, R extends Repository<T>> {
  protected abstract repository: R;
  protected observables?: Record<string, Function>;
  protected observer = observer();

  constructor() {
    if (this.observables) {
      Object.entries(this.observables).forEach(([key, value]) => {
        this.observer.add(key, value.call(this));
      });
    }
  }

  find(query: Partial<T> | Array<string> | { [K in keyof DocType<T>]?: Array<DocType<T>[K]> }): Promise<DocType<T>[]> {
    return this.repository.find(query);
  }

  PaginatedFind(query: Partial<T>, sort: any, startIndex: number, limit: number): Promise<DocType<T>[]> {
    return this.repository.PaginatedFind(query, sort, startIndex, limit);
  }

  findOne(query: string | Partial<T>): Promise<DocType<T> | null> {
    return this.repository.findOne(query);
  }

  findOneWithException(query: string | Partial<T>) {
    return this.repository.findOneWithException(query);
  }

  create(data: Partial<T>) {
    return this.repository.create(data);
  }

  update(query: string | Partial<T>, data: Partial<T>, upsert = false, many = false) {
    return this.repository.update(query, data, upsert, many);
  }

  delete(query: string | Partial<T>) {
    return this.repository.delete(query);
  }

  count(query?: Partial<T>) {
    return this.repository.count(query);
  }

  increment(query: string | Partial<T>, data: { [key in keyof Partial<DocType<T>>]: number }) {
    return this.repository.increment(query, data);
  }

  // eslint-disable-next-line no-shadow
  static instance<T, A extends Array<any>>(obj: new (...args: A) => T) {
    const instance = (...args: A): T => {
      const _obj = obj as unknown as { _instance: null | T } & (new () => T);
      if (_obj._instance) {
        return _obj._instance;
      }
      // eslint-disable-next-line new-cap
      _obj._instance = new obj(...args);
      return _obj._instance;
    };
    if (!('_instance' in obj)) {
      Object.assign(obj, { _instance: null, instance });
    }
    return (<{ _instance: null | T; instance: typeof instance } & (new (...args: A) => T)>obj).instance;
  }
}
