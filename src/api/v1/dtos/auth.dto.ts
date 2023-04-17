import { check, param } from 'express-validator';
import { MESSAGES } from '@config';
import { UserResponseDTO } from './user.dto';
import { UserInterface } from '@interfaces/User.Interface';

export const authRequestDTO = {
  login: [
    check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
  ],
  email: [check('email').isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL)],
  code: [param('code').exists()],
  password: [
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
    check('confirmPassword').custom((value: string, { req }) => {
      if (value !== req.body.password) {
        // throw error if passwords do not match
        return false;
      }
      return value;
    }),
  ],
  register: [
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

export class AuthResponseDTO {
  static login = (data: { token: string; user: DocType<UserInterface> }) => {
    const result = {
      user: UserResponseDTO.User(data.user),
      token: data.token,
    };
    return result;
  };

  static signUp = UserResponseDTO.User;
  static User = UserResponseDTO.User;
}
