import { param, body } from 'express-validator';
// import { keys } from 'ts-transformer-keys';

export default (k: [], resource: string) => {
  // TODO:
  // k =keys<T>()
  const create = k.map((v) => body(<string>v).exists());
  return {
    create,
    id: [param(`${resource}Id`).exists()],
    update: create.concat([param(`${resource}Id`).exists()]),
  };
};

// function <T>(data: DocType<T> |DocType<T> [], remove: [keyof DocType<T>]){
//   if
//   remove.forEach(v=> delete data[v])
//   return data
// }
