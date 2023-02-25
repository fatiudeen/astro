/* eslint-disable indent */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import httpResponse from '@helpers/HttpResponse';
import Service from '@services/service';
import httpError from '@helpers/HttpError';
import multer from '@helpers/multer';
import safeQuery from '@utils/safeQuery';
import httpStatus from 'http-status';

export default abstract class Controller<T> {
  protected HttpError = httpError;
  protected HttpResponse = httpResponse;
  protected resource;
  protected resourceId;
  abstract service: Service<T>;
  protected readonly fileProcessor = multer;
  protected processFile = (req: Request) => {
    let multerFile!: 'path' | 'location' | 'buffer';
    if (this.fileProcessor.storageType === 'disk') {
      multerFile = 'path';
    } else if (this.fileProcessor.storageType === 'memory') {
      if (req.file) {
        // const base64String = Buffer.from(req.file.buffer).toString('base64');
        multerFile = 'buffer';
      }
    } else {
      multerFile = 'location';
    }
    if (req.file) {
      req.body[req.file.fieldname] = (<any>req.file)[multerFile];
    }
    if (req.files && Array.isArray(req.files)) {
      // eslint-disable-next-line no-undef
      const data = (<Express.Multer.File[]>req.files).map((file) => {
        return (<any>file)[multerFile];
      });
      const fieldname = req.files[0].fieldname;
      (<any>req.body).$push = {
        [fieldname]: { $each: data },
      };
    } else if (req.files && !Array.isArray(req.files)) {
      Object.entries(req.files).forEach(([key, value]) => {
        const data = value.map((file) => {
          return (<any>file)[multerFile];
        });
        (<any>req.body).$push = {
          [key]: { $each: data },
        };
      });
    }
  };
  protected paginate = async (req: Request, service: Service<T>) => {
    let query = safeQuery(req);
    let page: number = 1;
    let limit: number = 10;
    if ('page' in query) {
      const { page: _, ..._query } = query;
      page = parseInt(_, 10);
      query = _query;
    }
    if ('limit' in query) {
      const { limit: _, ..._query } = query;
      limit = parseInt(_, 10);
      query = _query;
    }
    query = Object.entries(query).length > 1 ? query : {};
    const startIndex = limit * (page - 1);
    const totalDocs = await service.count();
    const totalPages = Math.floor(totalDocs / limit) + 1;
    // eslint-disable-next-line newline-per-chained-call
    const data = await service
      .find(<T>query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();
    return {
      data,
      limit,
      totalDocs,
      page,
      totalPages,
    };
  };
  protected control =
    (fn: (req: Request) => Promise<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await fn(req);
        if (result.redirect) {
          res.redirect(result.redirectUri);
        } else {
          let status: number = httpStatus.OK;
          if (req.method === 'POST') {
            status = httpStatus.CREATED;
          }
          this.HttpResponse.send(res, result, status);
        }
      } catch (error) {
        logger.error([error]);
        next(error);
      }
    };
  constructor(resource: string) {
    this.resource = resource;
    this.resourceId = `${resource}Id`;
  }

  create = this.control((req: Request) => {
    const data = <T>req.body;
    return this.service.create(data);
  });

  get = this.control((req: Request) => {
    return this.paginate(req, this.service);
  });

  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  update = this.control(async (req: Request) => {
    this.processFile(req);
    const result = await this.service.update(req.params[this.resourceId], req.body);

    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  delete = this.control(async (req: Request) => {
    const result = await this.service.delete(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}
