import { Types } from 'mongoose';
/* eslint-disable no-unused-vars */
export interface SessionInterface {
  userId: string | Types.ObjectId;
  token: string;
  isLoggedIn: boolean;
  getRefreshToken?(): string;
}
