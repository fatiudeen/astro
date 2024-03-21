import { check, param } from 'express-validator';
import { MESSAGES } from '@config';
import { UserInterface, UserSex } from '@interfaces/User.Interface';
import { UserResponseDTO } from './user.dto';

export const authRequestDTO = {
  login: [
    check('username').exists().toLowerCase(),
    check('password').isLength({ min: 8 }).withMessage(MESSAGES.SHORT_PASSWORD),
  ],
  email: [check('email').toLowerCase().isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL)],
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
    check('email').toLowerCase().isEmail().normalizeEmail().withMessage(MESSAGES.INVALID_EMAIL),
    check('firstName').exists(),
    check('lastName').exists(),
    check('username').exists(),
    check('location').exists(),
    check('dob').exists().isString(),
    check('sex').exists().isIn(Object.values(UserSex)),
    check('phoneNumber.countryCode').exists(),
    check('phoneNumber.number').exists().isMobilePhone(['en-NG', 'en-US', 'en-IN']),
    check('profile.about').optional(),
    check('profile.league').optional(),
    check('profile.frequency').optional(),
    check('profile.betPerformance').optional(),
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
