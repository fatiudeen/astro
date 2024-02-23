/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
// import { OPTIONS } from '@config';
import HttpError from '@helpers/HttpError';
import { Model, Types } from 'mongoose';

// import shortUUID from 'short-uuid';

export default abstract class Repository<T> {
  protected abstract model: Model<T>;

  find(_query?: Partial<T> | Array<string> | { [K in keyof DocType<T>]?: Array<DocType<T>[K]> }) {
    return new Promise<DocType<T>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      // query = this.normalizeId(query);

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => val) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
        }

      const q = this.model.find(query);
      q.lean()
        .then((r) => {
          resolve(<DocType<T>[]>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  PaginatedFind(_query: Partial<T>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<T>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};

      const q = this.model.find(query).sort(sort).skip(startIndex).limit(limit);
      q.lean()
        .then((r) => {
          resolve(<DocType<T>[]>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(_query: string | Partial<T>) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const query = _query;
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.then((r) => {
        if (!r) {
          resolve(null);
        } else resolve(<DocType<T>>r.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }

  findOneWithException = (_query: string | Partial<T>): Promise<DocType<T>> => {
    return new Promise<DocType<T>>((resolve, reject) => {
      const query = _query;
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.then((r) => {
        if (!r) {
          reject(new HttpError(`${this.model.modelName} not found`, 404));
        } else resolve(<DocType<T>>r.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  };

  /**
   *  NOTE: update many will always return null
   * @param _query
   * @param data
   * @param upsert
   * @param many
   * @returns
   */
  update(_query: string | Partial<T>, data: Partial<T>, upsert = false, many = false) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const query = _query;
      const options = { new: true, upsert: false };
      if (upsert) {
        options.upsert = true;
      }

      const q =
        typeof query === 'object'
          ? many
            ? this.model.updateMany(query, data, options)
            : this.model.findOneAndUpdate(query, data, options)
          : this.model.findByIdAndUpdate(query, data, options);
      q.then((r) => {
        if (!r || 'acknowledged' in r) {
          resolve(null);
        } else resolve(<DocType<T>>r.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }

  create(data: Partial<T>) {
    return new Promise<DocType<T>>((resolve, reject) => {
      this.model
        .create(data)
        .then((user) => {
          resolve(user.toObject());
        })
        .catch((e) => reject(e));
    });
  }

  delete(_query: string | Partial<T>) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const query = _query;
      const options = { new: true };

      const q =
        typeof query === 'object'
          ? this.model.findOneAndDelete(query, options)
          : this.model.findByIdAndDelete(query, options);
      q.then((r) => {
        if (!r) {
          resolve(null);
        }
        resolve(<DocType<T>>r!.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }

  count(query: Partial<T> = {}) {
    return this.model.countDocuments(query);
  }

  // eslint-disable-next-line no-unused-vars
  increment(_query: string | Partial<T>, data: { [key in keyof Partial<DocType<T>>]: number }) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const query = _query;
      const options = { new: true };

      const q =
        typeof query === 'object'
          ? this.model.findOneAndUpdate(query, { $inc: data }, options)
          : this.model.findByIdAndUpdate(query, { $inc: data }, options);
      q.then((r) => {
        if (!r) {
          resolve(null);
        }
        resolve(<DocType<T>>r!.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }

  static reusableQueries() {
    const getUserLikesOnPost = (q: Array<Record<string, any>>, currentUser: string) => {
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
    const populatePostProperties = (
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
    const projectPost = (q: Array<Record<string, any>>) => {
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
    const populateSharedPost = (q: Array<Record<string, any>>, user?: string) => {
      const p: Array<any> = [];
      if (user) {
        getUserLikesOnPost(p, user);
      }
      populatePostProperties(p, true, true, true, true, true);
      projectPost(p);

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
    const getUserLikesOnComment = (q: Array<Record<string, any>>, currentUser: string) => {
      q.push(
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
          $set: {
            liked: { $cond: { if: { $gt: [{ $size: '$userLike' }, 0] }, then: true, else: false } },
          },
        },
      );
    };
    const projectComment = (q: Array<Record<string, any>>) => {
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
          thread: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      });
    };
    const populateCommentProperties = (
      q: Array<Record<string, any>>,
      user: boolean,
      like: boolean,
      replies: boolean,
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

    const populateBookmarkedPost = (q: Array<Record<string, any>>, user?: string) => {
      const p: Array<any> = [];
      if (user) {
        getUserLikesOnPost(p, user);
      }
      populatePostProperties(p, true, true, true, true, true);
      projectPost(p);

      q.push(
        {
          $lookup: {
            from: 'posts',
            localField: 'postId',
            foreignField: '_id',
            pipeline: p,
            as: 'postId',
          },
        },
        {
          $unwind: {
            path: '$postId',
            // includeArrayIndex: <string>,
            preserveNullAndEmptyArrays: true,
          },
        },
      );
    };

    return {
      projectPost,
      populateSharedPost,
      getUserLikesOnPost,
      populatePostProperties,
      getUserLikesOnComment,
      projectComment,
      populateCommentProperties,
      populateBookmarkedPost,
    };
  }
}
