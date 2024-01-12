import { PostInterface } from '@interfaces/Post.Interface';
import Post from '@models/Post';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class PostRepository extends Repository<PostInterface> {
  protected model = Post;

  userLike = (q: Array<Record<string, any>>, currentUser: string) => {
    q.push(
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
        $set: { liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } } },
      },
    );
  };

  populate = (
    q: Array<Record<string, any>>,
    user: boolean,
    comment: boolean,
    like: boolean,
    bookmarks: boolean,
    shared: boolean,
  ) => {
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
          foreignField: 'postId',
          as: 'postLikes',
        },
      });
      set.likes = { $size: '$postLikes' };
    }

    if (comment) {
      q.push({
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'postComment',
        },
      });
      set.comments = { $size: '$postComment' };
    }

    if (bookmarks) {
      q.push({
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'postId',
          as: 'postsBookmarks',
        },
      });
      set.bookmarks = { $size: '$postsBookmarks' };
    }

    if (shared) {
      q.push({
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'sharedPost',
          as: 'sharedPosts',
        },
      });
      set.shared = { $size: '$sharedPosts' };
    }
    q.push({
      $set: set,
    });
  };

  populateSharedPost = (q: Array<Record<string, any>>, user?: string) => {
    const p: Array<any> = [];
    if (user) {
      this.userLike(p, user);
    }
    this.populate(p, true, true, true, true, true);
    this.project(p);

    q.push(
      {
        $lookup: {
          from: 'posts',
          localField: 'sharedPost',
          foreignField: '_id',
          pipeline: p,
          as: 'sharedPost',
        },
      },
      {
        $unwind: {
          path: '$sharedPost',
          // includeArrayIndex: <string>,
          preserveNullAndEmptyArrays: true,
        },
      },
    );
  };

  project = (q: Array<Record<string, any>>) => {
    q.push({
      $project: {
        _id: 1,
        user: {
          _id: '$userData._id',
          username: '$userData.username',
          avatar: '$userData.avatar',
          firstName: '$userData.firstName',
          lastName: '$userData.lastName',
        },
        liked: 1,
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
        createdAt: 1,
        updatedAt: 1,
      },
    });
  };

  PaginatedFind(_query: Partial<PostInterface>, _sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<PostInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      let currentUser;
      if ('currentUser' in query) {
        currentUser = query.currentUser;
        delete query.currentUser;
      }

      if ('userId' in query) {
        query.userId = new Types.ObjectId(query.userId);
      }
      // if ('deleted' in query) {
      //   query.deleted = { $ne: true };
      // }
      let sort = _sort || { createAt: -1 };

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
      if (currentUser) {
        this.userLike(q, currentUser);
      }
      this.populate(q, true, true, true, true, true);

      this.populateSharedPost(q, currentUser);

      this.project(q);

      this.model
        .aggregate<PostInterface>(q as Array<any>)
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
        $match: { userId: new Types.ObjectId(userId) },
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
    return (result[0]?.likes || 0) as number;
  }

  async countUserComments(userId: string) {
    const result = await this.model.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) },
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
    return (result[0]?.comments || 0) as number;
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
    return (result[0]?.shared || 0) as number;
  }

  getInfluentialFollowedUsersPosts(userId: string, users: string[], startIndex: number, limit: number) {
    const q: any = [
      {
        $match: { userId: { $in: users.map((v) => new Types.ObjectId(v)) }, deleted: { $ne: true } },
      },
    ];
    this.userLike(q, userId);
    this.populate(q, true, true, true, true, true);
    this.populateSharedPost(q);
    q.push(
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
      {
        $skip: startIndex,
      },
      { $sort: { influenceScore: -1, timestamp: -1 } },
      { $limit: limit },
    );
    return <DocType<PostInterface>[]>(<unknown>this.model.aggregate(q));
  }

  async countPosts(users: string[]) {
    const q: any = [
      {
        $match: { userId: { $in: users.map((v) => new Types.ObjectId(v)) }, deleted: { $ne: true } },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];
    const result = await this.model.aggregate(q);
    return result[0]?.count || 0;
  }

  findOneWithAllData(_query: string | Partial<PostInterface>) {
    return new Promise<DocType<PostInterface> | null>((resolve, reject) => {
      let query: Record<string, any> = typeof _query === 'string' ? { _id: _query } : _query;
      let currentUser;
      if ('currentUser' in query) {
        currentUser = query.currentUser;
        delete query.currentUser;
      }

      const q = [
        {
          $match: query,
        },
      ];

      if (currentUser) {
        this.userLike(q, currentUser);
      }
      this.populate(q, true, true, true, true, true);

      this.populateSharedPost(q);
      this.project(q);

      this.model
        .aggregate<PostInterface>(q)
        .then((r) => {
          if (!r[0]) {
            resolve(null);
          } else resolve(<DocType<PostInterface>>r[0]);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
