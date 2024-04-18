import { faker } from '@faker-js/faker';

export const invalidEventId = faker.database.mongodbObjectId().toString();
export const validEventId = faker.database.mongodbObjectId().toString();

export const validEvent = {
  name: faker.random.word(),
  price: faker.finance.amount(),
  description: faker.random.word(),
  expires: faker.date.future(),
};

export const invalidEvent = {
  examples: faker.random.word(),
};

export const validEventUpdateData = {
  example: faker.random.word(),
};
