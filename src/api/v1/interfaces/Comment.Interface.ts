import { IMedia } from '@interfaces/Common.Interface';
import { Types } from 'mongoose';

export interface CommentInterface {
  postId: string | Types.ObjectId;
  liked: boolean;
  likes: number;
  text: string;
  media: IMedia;
  userId: string | Types.ObjectId;
  parentId: string | Types.ObjectId;
  replies: number;
  deleted: boolean;
  currentUser: string;
  // thread:
}
