/* eslint-disable func-names */
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import { model, Schema, Model } from 'mongoose';

const BookmarkSchema = new Schema<BookmarkInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  {
    timestamps: true,
  },
);

export default <Model<BookmarkInterface>>model('Bookmark', BookmarkSchema);
