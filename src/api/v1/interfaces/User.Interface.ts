/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { IMedia, IPhoneNumber } from '@interfaces/Common.Interface';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserSex {
  MALE = 'm',
  FEMALE = 'f',
  OTHERS = 'o',
}
export interface UserInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  verifiedEmail: boolean;
  verifiedPhoneNumber: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  avatar?: IMedia;
  hasPassword: boolean;
  username: string;
  dob: string;
  sex: UserSex;
  phoneNumber: IPhoneNumber;
  location: string; // TODO:
  address: string;
  followers: number;
  following: number;
  isFollower: boolean;
  isFollowing: boolean;
  winningStreak: number;
  online: boolean;
  socketId: string;
  totalWinning: number;
  totalGames: number;
  profile: {
    about: string;
    league: string;
    frequency: string;
    betPerformance: string;
  };
}

// export interface IUserResponseDTO extends DocType<Pick<UserInterface, 'email' | 'role' | 'avatar'>> {}
