/* eslint-disable func-names */
import { LikeInterface } from '@interfaces/Like.Interface';
import { model, Schema, Model } from 'mongoose';

const LikeSchema = new Schema<LikeInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  {
    timestamps: true,
  },
);

export default <Model<LikeInterface>>model('Like', LikeSchema);
