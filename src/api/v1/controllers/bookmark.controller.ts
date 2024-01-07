/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BookmarkService from '@services/bookmark.service';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Controller from '@controllers/controller';
// import { BookmarkResponseDTO } from '@dtos/bookmark.dto';

class BookmarkController extends Controller<BookmarkInterface> {
  service = new BookmarkService();
  responseDTO = undefined; //BookmarkResponseDTO.Bookmark;
  toggle = this.control(async (req: Request) => {
    const result = await this.service.toggle(req.user?._id!, req.params.postId);
    return result;
  });
}

export default BookmarkController;
