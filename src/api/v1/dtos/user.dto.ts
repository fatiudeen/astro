import { check, param } from 'express-validator';
import { MESSAGES } from '@config';

export default {
  id: [param('userId').exists()],
  update: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
    check('confirmPassword').custom((value: string, { req }) => {
      if (value !== req.body.password) {
        // throw error if passwords do not match
        throw new Error(MESSAGES.PASSWORD_MATCH_ERROR);
      } else {
        return value;
      }
    }),
  ],
};
