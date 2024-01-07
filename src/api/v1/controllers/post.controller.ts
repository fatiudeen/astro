/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import PostService from '@services/post.service';
import { PostInterface } from '@interfaces/Post.Interface';
import Controller from '@controllers/controller';
// import { PostResponseDTO } from '@dtos/post.dto';

class PostController extends Controller<PostInterface> {
  service = new PostService();
  responseDTO = undefined; //PostResponseDTO.Post;
  get = this.control((req: Request) => {
    const param: Record<string, any> = req.params.userId ? { userId: req.params.userId } : { userId: req.user?._id };
    param.currentUser = req.user?._id;
    return this.paginate(req, this.service, param);
  });

  create = this.control((req: Request) => {
    this.processFile(req, true);
    const data = req.body;
    data.userId = req.user?._id;
    return this.service.create(data);
  });

  disableComment = this.control((req: Request) => {
    return this.service.update(req.params.postId, { hideComment: true });
  });

  share = this.control((req: Request) => {
    const data = req.body;
    data.userId = req.user?._id;
    return this.service.share(data);
  });

  feeds = this.control((req: Request) => {
    return this.service.feeds(req.user?._id);
  });
}

export default PostController;
