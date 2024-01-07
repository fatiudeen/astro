import { body, param } from 'express-validator';

export const commentRequestDTO = {
  create: [body('postId').exists(), body('text').exists(), body('media').optional()],
  reply: [body('text').exists(), body('media').optional(), body('parentId').exists()],
  id: [param('commentId').exists()],
  postId: [param('postId').exists()],
};
