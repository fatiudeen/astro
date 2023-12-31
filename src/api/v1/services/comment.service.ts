import { CommentInterface } from '@interfaces/Comment.Interface';
import CommentRepository from '@repositories/Comment.repository';
import Service from '@services/service';

class CommentService extends Service<CommentInterface, CommentRepository> {
  protected repository = new CommentRepository();
}

export default CommentService;
