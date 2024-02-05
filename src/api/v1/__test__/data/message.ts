import { faker } from '@faker-js/faker';

export const validMessage = {
  message: faker.lorem.sentence(), // Must exist
  to: null,
};

export const invalidMessage = {
  message: faker.lorem.sentence(), // Must exist
  to: faker.database.mongodbObjectId().toString(),
};

export const invalidConversationId = faker.database.mongodbObjectId().toString();
