import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Bookmark from '@models/Bookmark';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class BookmarkRepository extends Repository<BookmarkInterface> {
  protected model = Bookmark;
  postUserLike = (q: Array<Record<string, any>>, currentUser: string) => {
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

  postPopulate = (
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
  postProject = (q: Array<Record<string, any>>) => {
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
  populateBookmarkedPost = (q: Array<Record<string, any>>, user?: string) => {
    const p: Array<any> = [];
    if (user) {
      this.postUserLike(p, user);
    }
    this.postPopulate(p, true, true, true, true, true);
    this.postProject(p);

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

  find(_query?: Partial<BookmarkInterface>) {
    return new Promise<DocType<BookmarkInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      const q = this.model.find(query).populate('postId').sort({ createdAt: -1 });
      q.lean()
        .then((r) => {
          resolve(<DocType<BookmarkInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  PaginatedFind(_query: Partial<BookmarkInterface>, _sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<BookmarkInterface>[]>((resolve, reject) => {
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
      this.populateBookmarkedPost(q, currentUser);
      // const q = this.model.find(query).populate('postId').sort({ createdAt: -1 }).skip(startIndex).limit(limit);

      this.model
        .aggregate<BookmarkInterface>(q)
        .then((r) => {
          resolve(<DocType<BookmarkInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
