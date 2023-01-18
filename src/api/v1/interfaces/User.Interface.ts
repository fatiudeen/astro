/* eslint-disable no-unused-vars */
export interface UserInterface {
  email: string;
  password: string;
  role: 'user' | 'admin';
  verifiedEmail: boolean;
  verificationToken?: string;
  resetToken?: string;
  comparePasswords(password: string): boolean;
  getSignedToken(): string;
}
