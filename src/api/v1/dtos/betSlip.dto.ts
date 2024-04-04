import { body } from 'express-validator';

export const betSlipRequestDTO = {
  //   id: [param('betSlipId').exists()],
  create: [body('games').exists().isArray(), body('stake').exists().isFloat()],
  //   confirmAccount: [body('accountNumber').exists(), body('bankCode').exists()],
  //   removeBank: [param('accountId').exists()],
  //   withdraw: [body('accountId').exists(), body('amount').exists()],
};
