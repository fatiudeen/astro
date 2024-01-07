/* eslint-disable import/no-unresolved */
import BookmarkController from '@controllers/bookmark.controller';
import { bookmarkRequestDTO } from '@dtos/bookmark.dto';
import Route from '@routes/route';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';

class BookmarkRoute extends Route<BookmarkInterface> {
  controller = new BookmarkController('bookmark');
  dto = bookmarkRequestDTO;
  initRoutes() {
    this.router.get('/', this.controller.get);
    this.router.route('/:postId').put(this.validator(this.dto.postId), this.controller.toggle);
    return this.router;
  }
}
export default BookmarkRoute;
