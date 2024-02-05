/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BookmarkService from '@services/bookmark.service';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Controller from '@controllers/controller';
// import { BookmarkResponseDTO } from '@dtos/bookmark.dto';

class BookmarkController extends Controller<BookmarkInterface> {
  service = new BookmarkService();
  responseDTO = undefined; // BookmarkResponseDTO.Bookmark;
  toggle = this.control(async (req: Request) => {
    const result = await this.service.toggle(req.user?._id!, req.params.postId);
    return result;
  });

  get = this.control((req: Request) => {
    const param: Record<string, any> = { userId: req.user?._id };
    param.currentUser = req.user?._id;
    return this.paginate(req, this.service, param);
  });
}

export default BookmarkController;
