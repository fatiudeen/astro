import Repository from '@repositories/repository';

// single model methods
export default abstract class Service<T> extends Repository<T> {
  constructor(repository: Repository<T>) {
    const model = repository.model;
    super(model);
  }
}
