import { body, param } from 'express-validator';

export const subscriptionRequestDTO = {
  id: [param('userId').exists()],
  eventId: [param('eventId').exists()],
  create: [body('example').exists()],
  update: [body('example').exists()],
};
