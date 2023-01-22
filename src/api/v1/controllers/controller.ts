import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import httpResponse from '@helpers/HttpResponse';
import Service from '@services/service';
import httpError from '@helpers/HttpError';

export default abstract class Controller<T> {
  protected HttpError = httpError;
  protected HttpResponse = httpResponse;
  protected resource;
  protected resourceId;
  abstract service: Service<T>;
  constructor(resource: string) {
    this.resource = resource;
    this.resourceId = `${resource}Id`;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = <T>req.body;
      const result = await this.service.create(data);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.find().lean();
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findOne(req.params[this.resourceId]);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.update(req.params[this.resourceId], req.body);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.delete(req.params[this.resourceId]);
      if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
      this.HttpResponse.send(res, result);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
