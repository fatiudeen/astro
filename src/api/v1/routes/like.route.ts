/* eslint-disable import/no-unresolved */
import LikeController from '@controllers/like.controller';
import { likeRequestDTO } from '@dtos/like.dto';
import Route from '@routes/route';
import { LikeInterface } from '@interfaces/Like.Interface';

class LikeRoute extends Route<LikeInterface> {
  controller = new LikeController('like');
  dto = likeRequestDTO;
  initRoutes() {
    this.router
      .route('/:postId/post')
      .put(this.validator(this.dto.postId), this.controller.toggle)
      .get(this.controller.get);
    this.router
      .route('/:commentId/comment')
      .put(this.validator(this.dto.commentId), this.controller.toggle)
      .get(this.controller.get);

    return this.router;
  }
}
export default LikeRoute;
