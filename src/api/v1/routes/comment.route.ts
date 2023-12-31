/* eslint-disable import/no-unresolved */
import CommentController from '@controllers/comment.controller';
import { commentRequestDTO } from '@dtos/comment.dto';
import Route from '@routes/route';
import { CommentInterface } from '@interfaces/Comment.Interface';

class CommentRoute extends Route<CommentInterface> {
  controller = new CommentController('comment');
  dto = commentRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.controller.get)
      .post(
        this.fileProcessor.uploadArray<CommentInterface>('media'),
        this.validator(this.dto.create),
        this.controller.create,
      );
    this.router.route('/:commentId').delete(this.validator(this.dto.id), this.controller.delete);
    //   .get(this.controller.thread);

    this.router
      .route('/:commentId/replies')
      .get(
        this.fileProcessor.uploadArray<CommentInterface>('media'),
        this.validator(this.dto.id),
        this.controller.replies,
      )
      .post(this.validator(this.dto.reply), this.controller.create);

    return this.router;
  }
}
export default CommentRoute;
