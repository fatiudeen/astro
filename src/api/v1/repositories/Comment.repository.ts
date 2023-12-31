import { CommentInterface } from '@interfaces/Comment.Interface';
import Comment from '@models/Comment';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class CommentRepository extends Repository<CommentInterface> {
  protected model = Comment;

  PaginatedFind(_query: Partial<CommentInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<CommentInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      this.model
        .aggregate<CommentInterface>([
          // {
          //   $match: query,
          // },
          {
            $skip: startIndex,
          },
          {
            $limit: limit,
          },
          {
            $sort: sort,
          },
          {
            $lookup: {
              from: 'likes',
              let: { commentId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$commentId', '$$commentId'] },
                        { $eq: ['$userId', new Types.ObjectId(query.userId)] },
                      ],
                    },
                  },
                },
              ],
              as: 'userLike',
            },
          },
          {
            $set: {
              liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
            },
          },
          {
            $unwind: '$userData',
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'commentId',
              as: 'commentLikes',
            },
          },
          {
            $set: {
              likes: { $size: '$commentLikes' },
            },
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'parentId',
              as: 'commentChild',
            },
          },
          {
            $set: {
              replies: { $size: '$commentChild' },
            },
          },
          {
            $project: {
              _id: 1,
              postId: 1,
              liked: 1,
              likes: 1,
              text: 1,
              media: 1,
              userId: {
                _id: '$userData._id',
                username: '$userData.username',
                avatar: '$userData.avatar',
                firstName: '$userData.firstName',
                lastName: '$userData.lastName',
              },
              parentId: 1,
              replies: 1,
              commentLikes: 0,
              commentChild: 0,
            },
          },
        ])
        .then((r) => {
          resolve(<DocType<CommentInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
