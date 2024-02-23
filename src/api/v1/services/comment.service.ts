/* eslint-disable no-underscore-dangle */
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
          if (!post) reject(new HttpError('invalid post', 404));
          if (post?.hideComment) reject(new HttpError('commenting is disabled on this post'));
          return this.repository.create(data);
        })
        .then((comment) => {
          resolve(comment!);
        })
        .catch((error) => reject(error));
    });
  }

  createReply(data: CommentInterface) {
    return new Promise<DocType<CommentInterface>>((resolve, reject) => {
      this.findOne(data.parentId.toString())
        .then((comment) => {
          if (!comment) reject(new HttpError('invalid comment', 404));
          return this.repository.create(data);
        })
        .then((comment) => {
          resolve(comment!);
        })
        .catch((error) => reject(error));
    });
  }
  delete(query: string | Partial<CommentInterface>) {
    return this.repository.update(query, { deleted: true });
  }

  thread(query: Partial<CommentInterface>) {
    return new Promise((resolve, reject) => {
      this.findOne((query as any)._id)
        .then((comment) => {
          if (!comment) reject(new HttpError('invalid comment', 404));
          // return this.getThread(comment!, (query as any).currentUser);
          return this.repository.findThreadId(query);
        })
        .then(({ post, comments }) => {
          return Promise.all([
            this._postService().findOneWithAllData({ _id: post, currentUser: query.currentUser } as any),
            this.repository.find(comments, query.currentUser),
          ]);
        })
        .then(([post, comments]) => {
          resolve({ post, comments });
        })
        .catch((error) => reject(error));
    });
    // return this.repository.findOne(query);
  }
  async isPostExist(postId: string) {
    const post = await this._postService().findOneWithException(postId);
    // if (!post) throw new HttpError('invalid post', 404);
    return post;
  }

  async isCommentExist(commentId: string) {
    const comment = await this.findOneWithException(commentId);
    // if (!comment) throw new HttpError('invalid comment', 404);
    return comment;
  }
}
export default CommentService;
