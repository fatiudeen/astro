import { body, param } from 'express-validator';

export const commentRequestDTO = {
  create: [body('postId').exists(), body('text').exists(), body('media').optional(), body('parentId').optional()],
  reply: [
    param('commentId').exists(),
    body('commentId').exists(),
    body('text').exists(),
    body('media').optional(),
    body('parentId').optional(),
  ],
  id: [param('commentId').exists()],
  postId: [param('postId').exists()],
};
