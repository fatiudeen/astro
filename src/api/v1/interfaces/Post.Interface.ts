import { Types } from 'mongoose';
import { IMedia } from './Common.Interface';

export interface PostInterface {
  userId: string | Types.ObjectId;
  media: IMedia;
  hideComment: boolean;
  likes: number;
  comments: number;
  shared: number;
  bookmarks: number; // TODO: not implemented
  followersWhoLiked: string; // TODO: not implemented
  deleted: boolean;
  sharedPost: string | Types.ObjectId;
  content: string;
  currentUser: string;
  paid: boolean;
}
