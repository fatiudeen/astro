import { body, param } from 'express-validator';

export const postRequestDTO = {
  postId: [param('postId').exists()],
  userId: [param('userId').exists()],
  create: [
    body('media').optional(),
    body('userId').not().exists(),
    body('hiddenComment').not().exists(),
    body('deleted').not().exists(),
    body('sharedPost').not().exists(),
    body('content').exists(),
  ],
  share: [
    body('media').optional(),
    body('userId').not().exists(),
    body('hiddenComment').not().exists(),
    body('deleted').not().exists(),
    body('sharedPost').exists(),
    body('content').exists(),
  ],
};

// followersWhoLiked: string; // TODO: not implemented
