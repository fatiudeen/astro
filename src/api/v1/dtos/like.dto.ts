import { param } from 'express-validator';

export const likeRequestDTO = {
  postId: [param('postId').exists()],
  commentId: [param('commentId').exists()],
};
