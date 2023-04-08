/* eslint-disable new-cap */
import Repository from '@repositories/repository';
import observer from '@services/observer';
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

  find(query?: Partial<T>) {
    return this.repository.find(query);
  }
  findOne(query: string | Partial<T>) {
    return this.repository.findOne(query);
  }
  create(data: Partial<T>) {
    return this.repository.create(data);
  }

  update(query: string | Partial<T>, data: Partial<T>) {
    return this.repository.update(query, data);
  }

  delete(query: string | Partial<T>) {
    return this.repository.delete(query);
  }

  count(query?: Partial<T>) {
    return this.repository.count(query);
  }
}
