/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CommentService from '@services/comment.service';
import { CommentInterface } from '@interfaces/Comment.Interface';
import Controller from '@controllers/controller';
// import { CommentResponseDTO } from '@dtos/comment.dto';

class CommentController extends Controller<CommentInterface> {
  service = new CommentService();
  responseDTO = undefined; //CommentResponseDTO.Comment;
  create = this.control(async (req: Request) => {
    const data = req.body;
    data.userId = req.user?._id;
    const result = await this.service.create(data);
    return result;
  });

  get = this.control((req: Request) => {
    const param: Record<string, any> = { postId: req.params.postId };
    param.currentUser = req.user?._id;
    return this.paginate(req, this.service, param);
  });

  replies = this.control((req: Request) => {
    const param: Record<string, any> = { userId: req.user?._id, parentId: req.params.commentId };
    return this.paginate(req, this.service, param);
  });
  // get one == thread
  getOne = this.control(async (req: Request) => {
    const param = { _id: req.params[this.resourceId], currentUser: req.user?._id };
    const result = await this.service.findOne(param);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  createReply = this.control(async (req: Request) => {
    const data = req.body;
    data.userId = req.user?._id;
    const result = await this.service.createReply(data);
    return result;
  });
}

export default CommentController;
