/* eslint-disable no-restricted-syntax */
import { PostInterface } from '@interfaces/Post.Interface';
import Post from '@models/Post';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class PostRepository extends Repository<PostInterface> {
  protected model = Post;
  private reusableQueries = Repository.reusableQueries();

  PaginatedFind(_query: Partial<PostInterface>, _sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<PostInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};
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
      const sort = _sort || { createAt: -1 };

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
        this.reusableQueries.getUserLikesOnPost(q, currentUser);
      }
      this.reusableQueries.populatePostProperties(q, true, true, true, true, true);

      this.reusableQueries.populateSharedPost(q, currentUser);

      this.reusableQueries.projectPost(q);

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

  getInfluentialFollowedUsersPosts(userId: string, users: string[], startIndex: number, limit: number, paid = false) {
    const match = { userId: { $in: users.map((v) => new Types.ObjectId(v)) }, deleted: { $ne: true } };
    if (paid) {
      Object.assign(match, { paid });
    }
    const q: any = [
      {
        $match: match,
      },
    ];
    this.reusableQueries.getUserLikesOnPost(q, userId);
    this.reusableQueries.populatePostProperties(q, true, true, true, true, true);
    this.reusableQueries.populateSharedPost(q);
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
    this.reusableQueries.projectPost(q);
    return <DocType<PostInterface>[]>(<unknown>this.model.aggregate(q));
  }

  async countPosts(users: string[], paid = false) {
    const match = { userId: { $in: users.map((v) => new Types.ObjectId(v)) }, deleted: { $ne: true } };
    if (paid) {
      Object.assign(match, { paid });
    }
    const q: any = [
      {
        $match: match,
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
      const query: Record<string, any> = typeof _query === 'string' ? { _id: _query } : _query;
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
        this.reusableQueries.getUserLikesOnPost(q, currentUser);
      }
      this.reusableQueries.populatePostProperties(q, true, true, true, true, true);

      this.reusableQueries.populateSharedPost(q);
      this.reusableQueries.projectPost(q);

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
