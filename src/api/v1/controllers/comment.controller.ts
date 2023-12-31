/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CommentService from '@services/comment.service';
import { CommentInterface } from '@interfaces/Comment.Interface';
import Controller from '@controllers/controller';
// import { CommentResponseDTO } from '@dtos/comment.dto';

class CommentController extends Controller<CommentInterface> {
  service = new CommentService();
  responseDTO = undefined; //CommentResponseDTO.Comment;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <CommentInterface>req.body;
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

export default CommentController;
