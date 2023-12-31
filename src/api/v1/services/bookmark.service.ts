import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import BookmarkRepository from '@repositories/Bookmark.repository';
import Service from '@services/service';

class BookmarkService extends Service<BookmarkInterface, BookmarkRepository> {
  protected repository = new BookmarkRepository();
}

export default BookmarkService;
