import { Types } from 'mongoose';
import { IMedia } from './Common.Interface';

export interface MessageInterface {
  conversationId: string | Types.ObjectId;
  to: string | Types.ObjectId;
  from: string | Types.ObjectId;
  message: string;
  seen: string[];
  media: IMedia[];
}
