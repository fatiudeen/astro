/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import PostService from '@services/post.service';
import { PostInterface } from '@interfaces/Post.Interface';
import Controller from '@controllers/controller';
// import { PostResponseDTO } from '@dtos/post.dto';

class PostController extends Controller<PostInterface> {
  service = new PostService();
  responseDTO = undefined; // PostResponseDTO.Post;
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

  feeds = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    const page: number = 'page' in query ? parseInt(query.page, 10) : 1;
    'page' in query ? delete query.page : false;
    const limit: number = 'limit' in query ? parseInt(query.limit, 10) : 10;
    'limit' in query ? delete query.limit : false;
    const startIndex = limit * (page - 1);
    const { feeds, count } = await this.service.feeds(req.user?._id, startIndex, limit);
    const totalPages = Math.floor(count / limit) + 1;

    return {
      feeds,
      limit,
      totalDocs: count,
      page,
      totalPages,
    };
    // return this.service.feeds(req.user?._id);
  });
}

export default PostController;
