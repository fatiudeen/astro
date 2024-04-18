import { EventInterface } from '@interfaces/Event.Interface';
import { model, Schema, Model } from 'mongoose';

const EventSchema = new Schema<EventInterface>(
  {
    name: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    description: String,
    // hasSubscribed: { type: Boolean, default: false },
    // attending: { type: Number, default: 0 },
    expires: String,
  },
  {
    timestamps: true,
  },
);

export default <Model<EventInterface>>model('Event', EventSchema);
