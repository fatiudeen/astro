/* eslint-disable func-names */
import { SessionInterface } from '@interfaces/Session.Interface';
import { model, Schema, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { REFRESH_JWT_KEY, REFRESH_JWT_TIMEOUT } from '@config';

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
sessionSchema.methods.getRefreshToken = function () {
  // eslint-disable-next-line no-underscore-dangle
  return jwt.sign({ id: this._id }, REFRESH_JWT_KEY, { expiresIn: REFRESH_JWT_TIMEOUT });
};

export default <Model<SessionInterface>>model('session', sessionSchema);
