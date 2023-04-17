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

  find(
    query?:
      | Partial<
          T & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    paginate?: boolean,
  ) {
    return this.repository.find(query, (paginate = false));
  }
  findOne(query: string | Partial<T>) {
    return this.repository.findOne(query);
  }
  create(data: Partial<T>) {
    return this.repository.create(data);
  }

  update(
    query: string | Partial<T>,
    data:
      | Partial<T> & {
          load?: { key: string; value: any; toSet?: boolean | undefined } | undefined;
          unload?: { key: string; value: string | string[]; field?: string | undefined } | undefined;
          increment?: { key: keyof T; value: number } | undefined;
        },
    upsert = false,
    many = false,
  ) {
    return this.repository.update(query, data, upsert, many);
  }

  delete(query: string | Partial<T>) {
    return this.repository.delete(query);
  }

  count(query?: Partial<T>) {
    return this.repository.count(query);
  }
}
