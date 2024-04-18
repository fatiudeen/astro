import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import { model, Schema, Model } from 'mongoose';

const SubscriptionSchema = new Schema<SubscriptionInterface>(
  {
    // add schema here
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    subscribed: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

export default <Model<SubscriptionInterface>>model('Subscription', SubscriptionSchema);
