import { Types } from 'mongoose';

export interface BookmarkInterface {
  userId: string | Types.ObjectId;
  postId: string | Types.ObjectId;
  currentUser: string;
}
