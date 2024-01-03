/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import LikeService from '@services/like.service';
import { LikeInterface } from '@interfaces/Like.Interface';
import Controller from '@controllers/controller';
// import { LikeResponseDTO } from '@dtos/like.dto';

class LikeController extends Controller<LikeInterface> {
  service = new LikeService();
  responseDTO = undefined; //LikeResponseDTO.Like;
  toggle = this.control(async (req: Request) => {
    const result = await this.service.toggle(
      req.user?._id!,
      req.params.commentId || req.params.postId,
      !!req.params.postId,
    );
    return result;
  });
  get = this.control((req: Request) => {
    const param: Record<string, any> = req.params.postId
      ? { postId: req.params.postId }
      : { commentId: req.params.commentId };

    return this.paginate(req, this.service, param);
  });
}

export default LikeController;
