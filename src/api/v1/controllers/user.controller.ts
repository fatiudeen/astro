/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import UserService from '@services/user.service';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { UserResponseDTO } from '@dtos/user.dto';

class UserController extends Controller<UserInterface> {
  service = new UserService();
  responseDTO = UserResponseDTO.User;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (req.params[this.resourceId]) {
      await this.service.updateFollowStatus(req.user?._id, result!);
    }
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    this.processFile(req);
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <UserInterface>req.body;
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

export default UserController;
