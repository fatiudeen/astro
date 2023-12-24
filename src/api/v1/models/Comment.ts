/* eslint-disable func-names */
import { CommentInterface } from '@interfaces/Comment.Interface';
import { IMedia, MediaTypeEnum } from '@interfaces/Common.Interface';
import { model, Schema, Model } from 'mongoose';

const CommentSchema = new Schema<CommentInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    liked: Boolean,
    likes: Number,
    text: String,
    media: new Schema<IMedia>({
      url: String,
      type: {
        type: String,
        enum: Object.values(MediaTypeEnum),
      },
    }),
    parentId: String,
  },
  {
    timestamps: true,
  },
);

export default <Model<CommentInterface>>model('Comment', CommentSchema);
