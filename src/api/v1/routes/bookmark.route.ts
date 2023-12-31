/* eslint-disable import/no-unresolved */
import BookmarkController from '@controllers/bookmark.controller';
import { bookmarkRequestDTO } from '@dtos/bookmark.dto';
import Route from '@routes/route';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';

class BookmarkRoute extends Route<BookmarkInterface> {
  controller = new BookmarkController('bookmark');
  dto = bookmarkRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.controller.get).post(this.validator(this.dto.add), this.controller.add);
    this.router.route('/:bookmarkId').delete(this.validator(this.dto.remove), this.controller.remove);

    return this.router;
  }
}
export default BookmarkRoute;
