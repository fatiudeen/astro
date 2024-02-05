/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
import { LikeInterface } from '@interfaces/Like.Interface';
import LikeRepository from '@repositories/Like.repository';
import Service from '@services/service';
import PostService from '@services/post.service';
import HttpError from '@helpers/HttpError';
import CommentService from './comment.service';

class LikeService extends Service<LikeInterface, LikeRepository> {
  protected repository = new LikeRepository();
  private readonly _postService = Service.instance(PostService);
  private readonly _commentService = Service.instance(CommentService);
  toggle(userId: string, id: string, post = true) {
    return new Promise<DocType<LikeInterface>>((resolve, reject) => {
      const q = post ? this._postService() : this._commentService();
      const data = { userId };
      post ? Object.assign(data, { postId: id }) : Object.assign(data, { commentId: id });
      q.findOne(id)
        .then((post) => {
          if (!post) reject(new HttpError('invalid post', 404));
          return this.findOne(data);
        })
        .then((like) => {
          if (!like) return this.create(data);
          return this.delete(like._id);
        })
        .then((data) => {
          resolve(data!);
        })
        .catch((error) => reject(error));
    });
  }
}

export default LikeService;
