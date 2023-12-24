import { IMedia } from './Common.Interface';

export interface PostInterface {
  userId: string;
  media: IMedia;
  hiddenComment: boolean; // TODO: not implemented
  likes: number;
  comments: number;
  shared: number;
  bookmarks: number; // TODO: not implemented
  followersWhoLiked: string; // TODO: not implemented
}
