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
      .post(
        this.fileProcessor.uploadArray<PostInterface>('media'),
        this.validator(this.dto.create),
        this.controller.create,
      );
    this.router.route('/share').put(this.validator(this.dto.share), this.controller.share); // re-post
    this.router.route('/feeds').get(this.controller.feeds); // feeds
    this.router.route('/:userId/users').get(this.validator(this.dto.userId), this.controller.get); // by user

    this.router.route('/:postId').delete(this.validator(this.dto.postId), this.controller.delete);
    //   .get(this.controller.getOne);

    return this.router;
  }
}
export default PostRoute;
