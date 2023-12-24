import { Types } from 'mongoose';

export interface LikeInterface {
  userId: string | Types.ObjectId;
  postId: string | Types.ObjectId;
}
