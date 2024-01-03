import { param } from 'express-validator';

export const followRequestDTO = {
  id: [param('userId').exists()],
};
