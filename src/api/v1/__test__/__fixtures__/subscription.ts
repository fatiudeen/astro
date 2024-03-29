import { faker } from '@faker-js/faker';

export const invalidSubscriptionId = faker.database.mongodbObjectId().toString();
export const validSubscriptionId = faker.database.mongodbObjectId().toString();

export const validSubscription = {
  example: faker.random.word(),
};

export const invalidSubscription = {
  examples: faker.random.word(),
};

export const validSubscriptionUpdateData = {
  example: faker.random.word(),
};
