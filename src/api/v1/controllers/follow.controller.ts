/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import FollowService from '@services/follow.service';
import { FollowInterface } from '@interfaces/Follow.Interface';
import Controller from '@controllers/controller';
// import { FollowResponseDTO } from '@dtos/follow.dto';

class FollowController extends Controller<FollowInterface> {
  service = new FollowService();
  responseDTO = undefined; // FollowResponseDTO.Follow;
  toggle = this.control(async (req: Request) => {
    const result = await this.service.toggle(req.user?._id!, req.params.userId);
    return result;
  });
  followers = this.control(async (req: Request) => {
    const params = { followed: req.params.userId || req.user?._id! };
    const result = await this.paginate(req, this.service, params);
    return result;
  });
  following = this.control(async (req: Request) => {
    const params = { userId: req.params.userId || req.user?._id! };
    const result = await this.paginate(req, this.service, params);
    return result;
  });
}

export default FollowController;
