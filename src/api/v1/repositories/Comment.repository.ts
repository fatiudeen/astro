import { CommentInterface } from '@interfaces/Comment.Interface';
import Comment from '@models/Comment';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class CommentRepository extends Repository<CommentInterface> {
  protected model = Comment;

  userLike = (q: Array<Record<string, any>>, currentUser: string) => {
    q.push(
      {
        $lookup: {
          from: 'likes',
          let: { commentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$commentId', '$$commentId'] }, { $eq: ['$userId', new Types.ObjectId(currentUser)] }],
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
    );
  };

  populate = (q: Array<Record<string, any>>, user: boolean, like: boolean, replies: boolean) => {
    const set: any = {};
    if (user) {
      q.push(
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
      );
      set.user = {
        _id: '$userData._id',
        username: '$userData.username',
        avatar: '$userData.avatar',
        firstName: '$userData.firstName',
        lastName: '$userData.lastName',
      };
    }

    if (like) {
      q.push({
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'commentId',
          as: 'commentLikes',
        },
      });
      set.likes = { $size: '$commentLikes' };
    }

    if (replies) {
      q.push({
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentId',
          as: 'commentChild',
        },
      });
      set.replies = { $size: '$commentChild' };
    }
    q.push({
      $set: set,
    });
  };

  project = (q: Array<Record<string, any>>) => {
    q.push({
      $project: {
        _id: 1,
        postId: 1,
        liked: 1,
        likes: 1,
        text: 1,
        media: 1,
        parentId: 1,
        replies: 1,
        user: 1,
      },
    });
  };

  PaginatedFind(_query: Partial<CommentInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<CommentInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      let currentUser;
      if ('currentUser' in query) {
        currentUser = query.currentUser;
        delete query.currentUser;
      }

      if ('userId' in query) {
        query.userId = new Types.ObjectId(query.userId);
      }

      if ('postId' in query) {
        query.postId = new Types.ObjectId(query.postId);
      }
      const q = [
        {
          $match: query,
        },
        {
          $skip: startIndex,
        },
        {
          $limit: limit,
        },
        {
          $sort: sort,
        },
      ];

      this.userLike(q, currentUser);
      this.populate(q, true, true, true);
      this.project(q);

      this.model
        .aggregate<CommentInterface>(q)
        .then((r) => {
          resolve(<DocType<CommentInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(_query: string | Partial<CommentInterface>) {
    return new Promise<DocType<CommentInterface> | null>((resolve, reject) => {
      const query = _query;
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.populate('userId', 'username avatar firstName lastName');
      q.then((r) => {
        if (!r) {
          resolve(null);
        } else resolve(<DocType<CommentInterface>>r.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }
}
