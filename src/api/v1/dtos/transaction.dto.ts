import { body } from 'express-validator';

// eslint-disable-next-line import/prefer-default-export
export const transactionRequestDTO = {
  init: [body('userId').exists()],
};
