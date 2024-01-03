/* eslint-disable func-names */
import { IMedia, MediaTypeEnum } from '@interfaces/Common.Interface';
import { PostInterface } from '@interfaces/Post.Interface';
import { model, Schema, Model } from 'mongoose';

const PostSchema = new Schema<PostInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    media: [
      new Schema<IMedia>({
        url: String,
        type: {
          type: String,
          enum: Object.values(MediaTypeEnum),
        },
      }),
    ],
    hideComment: Boolean,
    likes: Number,
    comments: Number,
    shared: Number,
    bookmarks: Number,
    followersWhoLiked: String,
    content: String,
    deleted: Boolean,
    sharedPost: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  {
    timestamps: true,
  },
);

export default <Model<PostInterface>>model('Post', PostSchema);
