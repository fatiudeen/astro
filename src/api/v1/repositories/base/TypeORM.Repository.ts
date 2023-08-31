// import {
//     DataSource,
//     EntitySchema,
//     Repository,
//     ObjectLiteral,
//     FindOneOptions,
//     Entity,
//     Column, PrimaryGeneratedColumn
//   } from 'typeorm';
//   import { RepositoryInterface, TransactionSession, UpdateData } from './Repository.Interface';

// export abstract class TypeOrmRepository<T extends ObjectLiteral> implements RepositoryInterface<T> {
//     abstract entity: EntitySchema<T>;
//     abstract dataSource: DataSource;
//     constructor() {}

//     find(
//       _query?: string[] | Partial<T> | { [K in keyof DocType<T>]?: DocType<T>[K][] | undefined } | undefined,
//       options?: OptionsParser<T> | undefined,
//     ): Promise<DocType<T>[]> {
//       // findmanybyid
//       // find many
//       let where  //= Array.isArray(_query) ?
//       if (Array.isArray(_query) && _query.length > 0) {
//         where = _query.map((val) => {id: val}) ;
//       } else if (_query){
//         for (const [felid, value] of Object.entries(_query)) {
//           Array.isArray(value) ? (where[felid] = { $in: value }) : false;
//         }} else where = {}
//       const model = this.dataSource.getRepository(this.entity);

//        model.find({where: {}, select: ''})
//     }
//     findOne(query: string | Partial<T>): Promise<DocType<T> | null> {
//       const model = this.dataSource.getRepository(this.entity);
//       model.createQueryBuilder().
//     }
//     create<D extends Partial<T> | Partial<T>[]>(
//       data: D,
//       session: D extends Partial<T>[] ? TransactionSession | undefined : never,
//     ): Promise<DocType<T> | DocType<T>[]> {
//       const model = this.dataSource.getRepository(this.entity);

//   return new Promise<>((resolve, reject)=>{
//     const _data = !Array.isArray(data)?  < Partial<T>[]>[data] : < Partial<T>[]>data
//     const entity =  _data.map(val=>{

//      return this.build(val)
//    })

//     model.save(entity).then(docs=>{
//       if (docs.length === 1){
//         resolve(<DocType<T>>docs[0])
//       } else resolve(<DocType<T>[]>docs)
//     })
//   })

//       }
//     update(
//       query: string | Partial<T>,
//       data: UpdateData<T>,
//       upsert: boolean,
//       many: boolean,
//       session: TransactionSession | undefined,
//     ): Promise<DocType<T> | null> {
//       throw new Error('Method not implemented.');
//     }
//     delete(query: string | Partial<T>): Promise<DocType<T> | null> {
//       throw new Error('Method not implemented.');
//     }
//     count(query: Partial<T>): Promise<number> {
//       const model = this.dataSource.getRepository(this.entity);
//       return model.count({});
//     }

//     private build(data: Partial<T>){
//           const _entity: T = new (<{new(): T}><unknown>this.entity)()
//       for (const [field, value] of Object.entries(data)){
//         (<any>_entity)[field] = value
//     }
//     return _entity
//     }
//   }
