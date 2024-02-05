import { check, param } from 'express-validator';
import { UserInterface, UserSex } from '@interfaces/User.Interface';

export const userRequestDTO = {
  id: [param('userId').exists()],
  update: [
    check('email').not().exists(),
    check('firstName').optional(),
    check('lastName').optional(),
    check('username').not().exists(),
    check('dob').optional().isString(),
    check('sex').optional().isIn(Object.values(UserSex)),
    check('phoneNumber.countryCode').optional(),
    check('phoneNumber.number').optional().isMobilePhone(['en-NG', 'en-US', 'en-IN']),
    check('profile.about').optional(),
    check('profile.league').optional(),
    check('profile.frequency').optional(),
    check('profile.betPerformance').optional(),
    check('password').not().exists(),
  ],
};

export class UserResponseDTO {
  static User = (data: DocType<UserInterface>) => {
    // const result = {
    //   _id: data._id!,
    //   email: data.email!,
    //   role: data.role!,
    //   avatar: data.avatar,
    //   createdAt: data.createdAt!,
    //   updatedAt: data.updatedAt!,
    // };
    const result: Partial<DocType<UserInterface>> = data;
    delete result.password;
    delete result.verificationToken;
    // delete result.__v

    return result;
  };
}
