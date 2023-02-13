import { param, body } from 'express-validator';
import { keys } from 'ts-transformer-keys';

export default <T extends Record<string, any>>(resource: string) => {
  // TODO:
  const k = keys<T>();
  const create = k.map((v) => body(<string>v).exists());
  return {
    create,
    id: [param(`${resource}Id`).exists()],
    update: create.concat([param(`${resource}Id`).exists()]),
  };
};
