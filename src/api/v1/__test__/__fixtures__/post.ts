import { faker } from '@faker-js/faker';

export const validPost = {
  content: faker.lorem.sentence(), // Must exist
};

export const invalidPost = {
  content: faker.lorem.sentence(), // Must exist
  hiddenComment: faker.lorem.word(),
};

export const validSharedPost = {
  content: faker.lorem.sentence(), // Must exist
  sharedPost: null,
};

export const invalidSharedPost = {
  content: faker.lorem.sentence(), // Must exist
  sharedPost: null,
  hiddenComment: faker.lorem.word(),
};

export const invalidPostId = faker.database.mongodbObjectId().toString();
