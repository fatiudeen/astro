/* eslint-disable func-names */
import { SessionInterface } from '@interfaces/Session.Interface';
import { model, Schema, Model } from 'mongoose';

const sessionSchema = new Schema<SessionInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: [true, 'The token is required'] },
    isLoggedIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export default <Model<SessionInterface>>model('session', sessionSchema);
