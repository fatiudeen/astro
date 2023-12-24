import { IMedia } from '@interfaces/Common.Interface';

export interface CommentInterface {
  postId: string;
  liked: boolean;
  likes: number;
  text: string;
  media: IMedia;
  userId: string;
  parentId: string;
}
