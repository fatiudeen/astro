import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Bookmark from '@models/Bookmark';
import Repository from '@repositories/repository';

export default class BookmarkRepository extends Repository<BookmarkInterface> {
  protected model = Bookmark;
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

  PaginatedFind(_query: Partial<BookmarkInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<BookmarkInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      const q = this.model.find(query).populate('postId').sort({ createdAt: -1 }).skip(startIndex).limit(limit);
      q.lean()
        .then((r) => {
          resolve(<DocType<BookmarkInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
