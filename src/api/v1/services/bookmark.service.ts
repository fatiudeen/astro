/* eslint-disable no-underscore-dangle */
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import BookmarkRepository from '@repositories/Bookmark.repository';
import Service from '@services/service';
import PostService from '@services/post.service';
import HttpError from '@helpers/HttpError';

class BookmarkService extends Service<BookmarkInterface, BookmarkRepository> {
  protected repository = new BookmarkRepository();
  private readonly _postService = Service.instance(PostService);

  toggle(userId: string, postId: string) {
    return new Promise<DocType<BookmarkInterface>>((resolve, reject) => {
      const q = this._postService(); // : this._commentService();
      const data = { userId, postId };
      q.findOne(postId)
        .then((post) => {
          if (!post) reject(new HttpError('invalid post', 404));
          return this.findOne(data);
        })
        .then((bookmark) => {
          if (!bookmark) return this.create(data);
          return this.delete(bookmark._id);
        })
        .then((_data) => {
          resolve(_data!);
        })
        .catch((error) => reject(error));
    });
  }
}

export default BookmarkService;
