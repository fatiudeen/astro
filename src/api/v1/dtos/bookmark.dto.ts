import { param } from 'express-validator';

export const bookmarkRequestDTO = {
  postId: [param('postId').exists()],
};
