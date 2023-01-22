/* eslint-disable no-unused-vars */
export interface UserInterface {
  email: string;
  password: string;
  role: 'user' | 'admin';
  session: boolean;
  verifiedEmail: boolean;
  verificationToken?: string;
  resetToken?: string;
  avatar?: string;
  comparePasswords(password: string): boolean;
  getSignedToken(): string;
}
