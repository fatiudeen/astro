/* eslint-disable indent */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import httpResponse from '@helpers/HttpResponse';
import Service from '@services/service';
import httpError from '@helpers/HttpError';
import Multer from '@helpers/multer';
import safeQuery from '@utils/safeQuery';
import httpStatus from 'http-status';
import { OPTIONS } from '@config';
import { MediaTypeEnum } from '@interfaces/Common.Interface';

export default abstract class Controller<T> {
  protected HttpError = httpError;
  protected HttpResponse = httpResponse;
  protected resource;
  protected resourceId;
  abstract service: Service<T, any>;
  readonly fileProcessor = OPTIONS.USE_MULTER ? Multer : null;
  abstract responseDTO?: Function;
  safeQuery = safeQuery;
  private categorizeFileType(mimeType: string) {
    if (mimeType.startsWith('image/')) {
      return MediaTypeEnum.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaTypeEnum.VIDEO;
    } else {
      return null;
    }
  }
  protected processFile = (req: Request, create = false) => {
    if (!this.fileProcessor) return;
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
      if (!req.file.fieldname) return;

      req.body[req.file.fieldname] = {
        url: (<any>req.file)[multerFile],
        type: this.categorizeFileType(req.file.mimetype),
      };
    }
    if (req.files && Array.isArray(req.files)) {
      if (req.files.length === 0) return;

      // eslint-disable-next-line no-undef
      const data = (<Express.Multer.File[]>req.files).map((file) => {
        return { url: (<any>file)[multerFile], type: this.categorizeFileType(file.mimetype) };
      });
      const fieldname = req.files[0].fieldname;
      if (!create) {
        (<any>req.body).$push = {
          [fieldname]: { $each: data },
        };
      } else {
        req.body[fieldname] = data;
      }
    } else if (req.files && !Array.isArray(req.files)) {
      Object.entries(req.files).forEach(([key, value]) => {
        const data = value.map((file) => {
          return { url: (<any>file)[multerFile], type: this.categorizeFileType(file.mimetype) };
        });
        if (!create) {
          (<any>req.body).$push = {
            [key]: { $each: data },
          };
        } else {
          (<any>req.body)[key] = data;
        }
      });
    }
  };

  protected control =
    (fn: (req: Request) => Promise<any>, responseDTO?: Function) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await fn(req);
        if (result.redirect) {
          return res.redirect(result.redirectUri);
        }
        const status = req.method === 'POST' ? httpStatus.CREATED : httpStatus.OK;
        responseDTO = responseDTO || this.responseDTO;
        this.HttpResponse.send(res, responseDTO ? responseDTO(result) : result, status);
      } catch (error) {
        logger.error([error]);
        next(error);
      }
    };

  protected paginate = async (req: Request, service: typeof this.service, param = {}) => {
    const query = this.safeQuery(req);
    const page: number = 'page' in query ? parseInt(query.page, 10) : 1;
    'page' in query ? delete query.page : false;
    const limit: number = 'limit' in query ? parseInt(query.limit, 10) : 10;
    'limit' in query ? delete query.limit : false;
    const startIndex = limit * (page - 1);
    const sort = query.sortBy ? { [query.sortBy]: query.sortOrder || -1 } : { createdAt: -1 };
    const totalDocs = await service.count(param);
    const totalPages = Math.floor(totalDocs / limit) + 1;
    // eslint-disable-next-line newline-per-chained-call
    const docs = await service.PaginatedFind(param, <any>sort, startIndex, limit);

    return {
      [`${this.resource}s`]: docs,
      limit,
      totalDocs,
      page,
      totalPages,
    };
  };

  parseSearchKey(keyword: string, fields: string[]) {
    return {
      $or: fields.map((v) => ({
        [v]: { $regex: keyword, $options: 'i' },
      })),
    };
  }

  constructor(resource: string) {
    this.resource = resource;
    this.resourceId = `${resource}Id`;
  }

  create = this.control((req: Request) => {
    this.processFile(req, true);
    const data = <T>req.body;
    return this.service.create(data);
  });

  get = this.control((req: Request) => {
    const query = this.safeQuery(req);
    const param: Record<string, any> = {};
    if (query.search) {
      Object.assign(param, this.parseSearchKey(<string>query.search, ['tags']));
      delete query.search;
    }
    return this.paginate(req, this.service, param);
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
