/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BookmarkService from '@services/bookmark.service';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Controller from '@controllers/controller';
// import { BookmarkResponseDTO } from '@dtos/bookmark.dto';

class BookmarkController extends Controller<BookmarkInterface> {
  service = new BookmarkService();
  responseDTO = undefined; //BookmarkResponseDTO.Bookmark;
  add = this.control(async (req: Request) => {
    const result = await this.service.add(req.user?._id, req.body.postId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  remove = this.control(async (req: Request) => {
    const result = await this.service.remove(req.params.bookmarkId);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default BookmarkController;
