import { PostInterface } from '@interfaces/Post.Interface';
import Post from '@models/Post';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class PostRepository extends Repository<PostInterface> {
  protected model = Post;
  PaginatedFind(_query: Partial<PostInterface>, _sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<PostInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      let currentUser;
      if ('currentUser' in query) {
        currentUser = query.currentUser;
        delete query.currentUser;
      }
      let sort = _sort || { createAt: -1 };

      // const q = this.model.find(query).populate('sharedPost').sort(sort).skip(startIndex).limit(limit);
      this.model
        .aggregate<PostInterface>([
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
              let: { postId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$postId', '$$postId'] }, { $eq: ['$userId', new Types.ObjectId(currentUser)] }],
                    },
                  },
                },
              ],
              as: 'userLike',
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
              foreignField: 'postId',
              as: 'postLikes',
            },
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'postId',
              as: 'postComment',
            },
          },
          {
            $lookup: {
              from: 'posts',
              localField: '_id',
              foreignField: 'sharedPost',
              as: 'sharedPosts',
            },
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'postId',
              as: 'postsBookmarks',
            },
          },
          {
            $lookup: {
              from: 'posts',
              localField: 'sharedPost',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'likes',
                    let: { postId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$postId', '$$postId'] },
                              { $eq: ['$userId', new Types.ObjectId(currentUser)] },
                            ],
                          },
                        },
                      },
                    ],
                    as: 'userLike',
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
                    foreignField: 'postId',
                    as: 'postLikes',
                  },
                },
                {
                  $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'postComment',
                  },
                },
                {
                  $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'sharedPost',
                    as: 'sharedPosts',
                  },
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'postsBookmarks',
                  },
                },
                {
                  $set: {
                    comments: { $size: '$postComment' },
                    likes: { $size: '$postLikes' },
                    shared: { $size: '$sharedPosts' },
                    bookmarks: { $size: '$postsBookmarks' },
                    liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
                  },
                },
              ],
              as: 'sharedPost',
            },
          },
          {
            $set: {
              comments: { $size: '$postComment' },
              likes: { $size: '$postLikes' },
              shared: { $size: '$sharedPosts' },
              bookmarks: { $size: '$postsBookmarks' },
              liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
              userId: {
                _id: '$userData._id',
                username: '$userData.username',
                avatar: '$userData.avatar',
                firstName: '$userData.firstName',
                lastName: '$userData.lastName',
              },
            },
          },
          {
            $project: {
              _id: 1,
              userId: {
                _id: '$userData._id',
                username: '$userData.username',
                avatar: '$userData.avatar',
                firstName: '$userData.firstName',
                lastName: '$userData.lastName',
              },
              postLikes: 0,
              postComment: 0,
              sharedPosts: 0,
              media: 1,
              hideComment: 1,
              likes: 1,
              comments: 1,
              shared: 1,
              bookmarks: 1,
              // followersWhoLiked: string, // TODO: not implemented
              deleted: 1,
              sharedPost: 1,
              content: 1,
            },
          },
        ])
        .then((r) => {
          resolve(<DocType<PostInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  async countUserLikes(userId: string) {
    const result = await this.model.aggregate([
      {
        $match: { userId },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'totalLikes',
        },
      },
      {
        $group: {
          _id: null,
          likes: { $sum: { $size: '$totalLikes' } },
        },
      },
    ]);
    return result[0].likes as number;
  }

  async countUserComments(userId: string) {
    const result = await this.model.aggregate([
      {
        $match: { userId },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'totalComments',
        },
      },
      {
        $group: {
          _id: null,
          comments: { $sum: { $size: '$totalComments' } },
        },
      },
    ]);
    return result[0].comments as number;
  }

  async countUserSharedPosts(userId: string) {
    const result = await this.model.aggregate([
      {
        $match: { userId },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'sharedPost',
          as: 'totalShared',
        },
      },
      {
        $group: {
          _id: null,
          shared: { $sum: { $size: '$totalShared' } },
        },
      },
    ]);
    return result[0].shared as number;
  }

  getInfluentialFollowedUsersPosts(userId: string, users: string[]) {
    return <DocType<PostInterface>[]>(<unknown>this.model.aggregate([
      { $match: { userId: { $in: users } } },
      {
        $lookup: {
          from: 'likes',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$postId', '$$postId'] }, { $eq: ['$userId', new Types.ObjectId(userId)] }],
                },
              },
            },
          ],
          as: 'userLike',
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
          foreignField: 'postId',
          as: 'postLikes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'postComment',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'sharedPost',
          as: 'sharedPosts',
        },
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'postId',
          as: 'postsBookmarks',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'sharedPost',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'likes',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ['$postId', '$$postId'] }, { $eq: ['$userId', new Types.ObjectId(userId)] }],
                      },
                    },
                  },
                ],
                as: 'userLike',
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
                foreignField: 'postId',
                as: 'postLikes',
              },
            },
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'postId',
                as: 'postComment',
              },
            },
            {
              $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'sharedPost',
                as: 'sharedPosts',
              },
            },
            {
              $lookup: {
                from: 'bookmarks',
                localField: '_id',
                foreignField: 'postId',
                as: 'postsBookmarks',
              },
            },
            {
              $set: {
                comments: { $size: '$postComment' },
                likes: { $size: '$postLikes' },
                shared: { $size: '$sharedPosts' },
                bookmarks: { $size: '$postsBookmarks' },
                liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
              },
            },
          ],
          as: 'sharedPost',
        },
      },
      {
        $set: {
          comments: { $size: '$postComment' },
          likes: { $size: '$postLikes' },
          shared: { $size: '$sharedPosts' },
          bookmarks: { $size: '$postsBookmarks' },
          liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
          userId: {
            _id: '$userData._id',
            username: '$userData.username',
            avatar: '$userData.avatar',
            firstName: '$userData.firstName',
            lastName: '$userData.lastName',
          },
        },
      },
      {
        $addFields: {
          influenceScore: {
            $sum: [
              { $multiply: [1, { $size: '$postLikes' }] },
              { $multiply: [1, { $size: '$postComment' }] },
              { $multiply: [1, { $size: '$sharedPosts' }] },
            ],
          },
        },
      },
      { $sort: { influenceScore: -1, timestamp: -1 } },
      { $limit: 10 },
    ]));
  }
}
