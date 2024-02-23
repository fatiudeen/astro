/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { CommentInterface } from '@interfaces/Comment.Interface';
import Comment from '@models/Comment';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class CommentRepository extends Repository<CommentInterface> {
  protected model = Comment;
  private reusableQueries = Repository.reusableQueries();

  PaginatedFind(_query: Partial<CommentInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<CommentInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};
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

      if ('parentId' in query) {
        query.parentId = new Types.ObjectId(query.parentId);
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

      if (currentUser) {
        this.reusableQueries.getUserLikesOnComment(q, currentUser);
      }
      this.reusableQueries.populateCommentProperties(q, true, true, true);
      this.reusableQueries.projectComment(q);

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

  findOneThread(_query: string | Partial<CommentInterface>) {
    return new Promise<DocType<CommentInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = typeof _query === 'string' ? { _id: _query } : _query;
      let currentUser;
      if ('currentUser' in query) {
        currentUser = query.currentUser;
        delete query.currentUser;
      }

      if ('_id' in query) {
        query._id = new Types.ObjectId(query._id);
      }

      const q = [
        {
          $match: query,
        },
        {
          $graphLookup: {
            from: 'comments',
            startWith: '$parentId',
            connectFromField: 'parentId',
            connectToField: '_id',
            as: 'thread',
            //  maxDepth: <number>,
            //  depthField: <string>,
            //  restrictSearchWithMatch: <document>
          },
        },
      ];

      if (currentUser) {
        this.reusableQueries.getUserLikesOnComment(q, currentUser);
      }
      this.reusableQueries.populateCommentProperties(q, true, true, true);

      // this.populateSharedPost(q);
      this.reusableQueries.projectComment(q);

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

  findThreadId(_query: string | Partial<CommentInterface>) {
    return new Promise<{ post: string; comments: string[] }>((resolve, reject) => {
      const query: Record<string, any> = typeof _query === 'string' ? { _id: _query } : _query;

      if ('_id' in query) {
        query._id = new Types.ObjectId(query._id);
      }

      if ('currentUser' in query) {
        delete query.currentUser;
      }

      const q = [
        {
          $match: query,
        },
        {
          $graphLookup: {
            from: 'comments',
            startWith: '$parentId',
            connectFromField: 'parentId',
            connectToField: '_id',
            as: 'thread',
            //  maxDepth: <number>,
            //  depthField: <string>,
            //  restrictSearchWithMatch: <document>
          },
        },
        {
          $project: {
            thread: 1,
          },
        },
      ];

      this.model
        .aggregate(q)
        .then((r) => {
          const ids = [];
          let post;
          ids.push(r[0]._id);
          r[0].thread.forEach((v: any) => {
            if (v.postId) {
              post = v.postId;
            }
            ids.push(v._id);
          });
          resolve({ post: post as unknown as string, comments: ids });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  find(
    _query?:
      | Partial<CommentInterface>
      | Array<string>
      | { [K in keyof DocType<CommentInterface>]?: Array<DocType<CommentInterface>[K]> },
    currentUser?: string,
  ) {
    return new Promise<DocType<CommentInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => new Types.ObjectId(val)) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
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
          $sort: { createdAt: 1 },
        },
      ] as any[];
      if (currentUser) {
        this.reusableQueries.getUserLikesOnComment(q, currentUser);
      }

      this.reusableQueries.populateCommentProperties(q, true, true, true);
      this.reusableQueries.projectComment(q);

      this.model
        .aggregate(q)
        .then((r) => {
          resolve(<DocType<CommentInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
