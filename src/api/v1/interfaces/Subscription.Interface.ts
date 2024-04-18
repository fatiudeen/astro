import { Types } from 'mongoose';

export interface SubscriptionInterface {
  // example: string;
  // Define properties and methods related to subscription
  userId?: string | Types.ObjectId;
  eventId?: string | Types.ObjectId;
  subscribed: string | Types.ObjectId;
}
