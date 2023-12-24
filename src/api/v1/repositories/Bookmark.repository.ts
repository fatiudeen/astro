import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Bookmark from '@models/Bookmark';
import Repository from '@repositories/repository';

export default class BookmarkRepository extends Repository<BookmarkInterface> {
  protected model = Bookmark;
}
