/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import LikeService from '@services/like.service';
import { LikeInterface } from '@interfaces/Like.Interface';
import Controller from '@controllers/controller';
// import { LikeResponseDTO } from '@dtos/like.dto';

class LikeController extends Controller<LikeInterface> {
  service = new LikeService();
  responseDTO = undefined; //LikeResponseDTO.Like;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <LikeInterface>req.body;
    const result = await this.service.update(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  delete = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default LikeController;
