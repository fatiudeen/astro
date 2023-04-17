import { check, param } from 'express-validator';
import { MESSAGES } from '@config';
import { IUserResponseDTO, UserInterface } from '@interfaces/User.Interface';

export const userRequestDTO = {
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

export class UserResponseDTO {
  static User = (data: DocType<UserInterface>): IUserResponseDTO => {
    const result: IUserResponseDTO = {
      _id: data._id!,
      email: data.email!,
      role: data.role!,
      avatar: data.avatar,
      createdAt: data.createdAt!,
      updatedAt: data.updatedAt!,
    };
    return result;
  };
}
