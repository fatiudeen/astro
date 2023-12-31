/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import CommentService from '@services/comment.service';
import { CommentInterface } from '@interfaces/Comment.Interface';
import Controller from '@controllers/controller';
// import { CommentResponseDTO } from '@dtos/comment.dto';

class CommentController extends Controller<CommentInterface> {
  service = new CommentService();
  responseDTO = undefined; //CommentResponseDTO.Comment;
  create = this.control((req: Request) => {
    const data = req.body;
    data.userId = req.user?._id;
    return this.service.create(data);
  });

  get = this.control((req: Request) => {
    const param: Record<string, any> = { userId: req.user?._id };
    return this.paginate(req, this.service, param);
  });

  replies = this.control((req: Request) => {
    const param: Record<string, any> = { userId: req.user?._id, parentId: req.params.commentId };
    return this.paginate(req, this.service, param);
  });
  // get one == thread
}

export default CommentController;
