import { CommentInterface } from '@interfaces/Comment.Interface';
import Comment from '@models/Comment';
import Repository from '@repositories/repository';

export default class CommentRepository extends Repository<CommentInterface> {
  protected model = Comment;
}
