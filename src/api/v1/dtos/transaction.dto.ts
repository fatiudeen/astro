import { body, check, param, query } from 'express-validator';

export const transactionRequestDTO = {
  init: [body('userId').exists()],
};
