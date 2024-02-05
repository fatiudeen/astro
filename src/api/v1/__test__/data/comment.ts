import { faker } from '@faker-js/faker';

export const validComment = {
  text: faker.lorem.sentence(), // Must exist
  postId: null,
};

export const invalidComment = {
  text: faker.lorem.sentence(), // Must exist
  hiddenComment: faker.lorem.word(),
};

export const invalidCommentId = faker.database.mongodbObjectId().toString();
