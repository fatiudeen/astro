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
    options?: OptionsParser<T>,
  ): Promise<DocType<T>[]> {
    return this.repository.find(query, options);
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
        } & { $setOnInsert?: Partial<T> },
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

  protected paginatedFind(query?: Partial<T & { page?: number | string; limit?: number | string }>) {
    return new Promise<{
      data: DocType<T>[];
      limit: number;
      totalDocs: number;
      page: number;
      totalPages: number;
    }>((resolve, reject) => {
      query = query || {};
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
          return this.find(query, { sort: { createdAt: -1 }, skip: startIndex, limit });
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
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
