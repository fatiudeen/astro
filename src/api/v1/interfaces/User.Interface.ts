/* eslint-disable no-unused-vars */
export interface UserInterface {
  email: string;
  password: string;
  role: 'user' | 'admin';
  verifiedEmail: boolean;
  verificationToken?: string;
  resetToken?: string;
  avatar?: string;
}

export interface IUserResponseDTO extends DocType<Pick<UserInterface, 'email' | 'role' | 'avatar'>> {}
