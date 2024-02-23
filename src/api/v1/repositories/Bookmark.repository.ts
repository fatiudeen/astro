import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Bookmark from '@models/Bookmark';
import Repository from '@repositories/repository';
import { Types } from 'mongoose';

export default class BookmarkRepository extends Repository<BookmarkInterface> {
  protected model = Bookmark;
  private reusableQueries = Repository.reusableQueries();

  find(_query?: Partial<BookmarkInterface>) {
    return new Promise<DocType<BookmarkInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};

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
      this.reusableQueries.populateBookmarkedPost(q, currentUser);
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
