import { CommentInterface } from '@interfaces/Comment.Interface';
import CommentRepository from '@repositories/Comment.repository';
import Service from '@services/service';
import PostService from '@services/post.service';
import HttpError from '@helpers/HttpError';

class CommentService extends Service<CommentInterface, CommentRepository> {
  protected repository = new CommentRepository();
  private readonly _postService = Service.instance(PostService);
  create(data: CommentInterface) {
    return new Promise<DocType<CommentInterface>>((resolve, reject) => {
      this._postService()
        .findOne(data.postId.toString())
        .then((post) => {
          if (!post) reject(new HttpError('invalid post'));
          if (post?.hideComment) reject(new HttpError('commenting is disabled on this post'));
          return this.create(data);
        })
        .then((comment) => {
          resolve(comment!);
        })
        .catch((error) => reject(error));
    });
  }
}
export default CommentService;
