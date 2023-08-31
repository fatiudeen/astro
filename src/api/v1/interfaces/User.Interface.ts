/* eslint-disable no-unused-vars */
export interface UserInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  verifiedEmail: boolean;
  verificationToken?: string;
  resetToken?: string;
  avatar?: string;
  fromOauth: boolean;
}

export interface IUserResponseDTO extends DocType<Pick<UserInterface, 'email' | 'role' | 'avatar'>> {}
