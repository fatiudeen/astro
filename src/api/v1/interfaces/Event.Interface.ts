import { Types } from 'mongoose';

export interface EventInterface {
  name: string;
  userId: string | Types.ObjectId;
  price: number;
  description: string;
  // hasSubscribed: boolean;
  // attending: number;
  expires: string;
}
