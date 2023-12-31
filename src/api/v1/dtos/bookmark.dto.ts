import { body, param } from 'express-validator';

export const bookmarkRequestDTO = {
  add: [body('postId').exists()],
  remove: [param('bookmarkId').exists()],
};
