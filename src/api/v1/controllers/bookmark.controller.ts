/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BookmarkService from '@services/bookmark.service';
import { BookmarkInterface } from '@interfaces/Bookmark.Interface';
import Controller from '@controllers/controller';
// import { BookmarkResponseDTO } from '@dtos/bookmark.dto';

class BookmarkController extends Controller<BookmarkInterface> {
  service = new BookmarkService();
  responseDTO = undefined; //BookmarkResponseDTO.Bookmark;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <BookmarkInterface>req.body;
    const result = await this.service.update(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  delete = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default BookmarkController;
