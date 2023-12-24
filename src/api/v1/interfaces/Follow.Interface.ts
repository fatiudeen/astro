import { Types } from 'mongoose';

export interface FollowInterface {
  userId: string | Types.ObjectId;
  followed: string | Types.ObjectId;
}
