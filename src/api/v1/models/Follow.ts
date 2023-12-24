/* eslint-disable func-names */
import { FollowInterface } from '@interfaces/Follow.Interface';
import { model, Schema, Model } from 'mongoose';

const FollowSchema = new Schema<FollowInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    followed: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

export default <Model<FollowInterface>>model('Follow', FollowSchema);
