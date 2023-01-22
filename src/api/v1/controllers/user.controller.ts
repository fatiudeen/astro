/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import userService from '@services/user.service';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { logger } from '@utils/logger';

class AuthController extends Controller<UserInterface> {
  service = userService;

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params[this.resourceId] || req.user?._id!;

      const result = await this.service.findOne(params);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params[this.resourceId] || req.user?._id!;
      const data = <UserInterface>req.body;
      if (req.file) data.avatar = (<any>req.file).location;
      const result = await this.service.update(params, data);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    try {
      const result = await this.service.delete(params);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}

export default new AuthController('user');
