/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import FollowService from '@services/follow.service';
import { FollowInterface } from '@interfaces/Follow.Interface';
import Controller from '@controllers/controller';
// import { FollowResponseDTO } from '@dtos/follow.dto';

class FollowController extends Controller<FollowInterface> {
  service = new FollowService();
  responseDTO = undefined; //FollowResponseDTO.Follow;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <FollowInterface>req.body;
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

export default FollowController;
