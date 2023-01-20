import Repository from '@repositories/repository';

// single model methods
export default abstract class Service<T> extends Repository<T> {
  // abstract repository: Repository<T>;
  protected repository;
  constructor(repository: Repository<T>) {
    const model = repository.model;
    super(model);
    this.repository = repository;
  }
}
