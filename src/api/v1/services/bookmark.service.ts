import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import BookmarkRepository from '@repositories/Bookmark.repository';
import Service from '@services/service';
import PostService from '@services/post.service';
import HttpError from '@helpers/HttpError';

class BookmarkService extends Service<BookmarkInterface, BookmarkRepository> {
  protected repository = new BookmarkRepository();
  private readonly _postService = Service.instance(PostService);

  add(userId: string, postId: string) {
    return new Promise<DocType<BookmarkInterface>>((resolve, reject) => {
      this._postService()
        .findOne(postId)
        .then((post) => {
          if (!post) reject(new HttpError('invalid post'));
          return this._postService().increment(postId, { bookmarks: 1 });
        })
        .then(() => {
          return this.create({ userId, postId });
        })
        .then((bookmark) => {
          resolve(bookmark!);
        })
        .catch((error) => reject(error));
    });
  }

  remove(bookmarkId: string) {
    return new Promise<DocType<BookmarkInterface>>((resolve, reject) => {
      let _bookmark;
      this.delete(bookmarkId)
        .then((bookmark) => {
          if (!bookmark) reject(new HttpError('invalid bookmark'));
          _bookmark = bookmark;
          return this._postService().increment(bookmark!.postId.toString(), { bookmarks: -1 });
        })
        .then(() => {
          resolve(_bookmark!);
        })
        .catch((error) => reject(error));
    });
  }
}

export default BookmarkService;
