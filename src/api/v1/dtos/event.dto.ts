import { body, param } from 'express-validator';

export const eventRequestDTO = {
  id: [param('eventId').exists()],
  create: [body('name').exists(), body('price').exists(), body('description').exists(), body('expires').exists()],
  update: [body('example').exists()],
};

// hasSubscribed: boolean;
// attending: number;
