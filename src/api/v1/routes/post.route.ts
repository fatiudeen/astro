/* eslint-disable import/no-unresolved */
import PostController from '@controllers/post.controller';
import { postRequestDTO } from '@dtos/post.dto';
import Route from '@routes/route';
import { PostInterface } from '@interfaces/Post.Interface';

class PostRoute extends Route<PostInterface> {
  controller = new PostController('post');
  dto = postRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.controller.get) // by user
      .post(this.validator(this.dto.create), this.controller.create);
    this.router.route('/share').put(this.controller.share); // re-post
    this.router.route('/feeds').put(this.controller.feeds); // feeds
    this.router.route('/:userId/users').put(this.validator(this.dto.userId), this.controller.get); // by user

    this.router.route('/:postId').delete(this.validator(this.dto.postId), this.controller.delete);
    //   .get(this.controller.getOne);

    return this.router;
  }
}
export default PostRoute;
