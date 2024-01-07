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
          if (!comment) reject(new HttpError('invalid comment'));
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

  // getThread(comment: DocType<CommentInterface>){
  //   if (comment.postId){
  //     // get post
  //     return comment
  //   }

  //   this.getThread()
  // }

  // findOne(query: string | Partial<CommentInterface>) {
  //   return new Promise<DocType<CommentInterface>>((resolve, reject) => {
  //     this.findOne(query)
  //       .then((comment) => {
  //         if (!comment) reject(new HttpError('invalid comment'));
  //         if (comment.postId){

  //         }
  //       })
  //       .then((comment) => {
  //         resolve(comment!);
  //       })
  //       .catch((error) => reject(error));
  //   });
  //   // return this.repository.findOne(query);
  // }
}
export default CommentService;
