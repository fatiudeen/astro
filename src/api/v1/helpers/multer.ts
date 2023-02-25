/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import multer from 'multer';
import aws from 'aws-sdk';
import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
// eslint-disable-next-line object-curly-newline
import {
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  OPTIONS,
  CONSTANTS,
} from '@config';
import { NextFunction } from 'express';
import { logger } from '@utils/logger';
import fs, { promises as fsAsync } from 'fs';

class Multer {
  private bucket = AWS_BUCKET_NAME;
  private region = AWS_REGION;
  private accessKeyId = AWS_ACCESS_KEY_ID;
  private secretAccessKey = AWS_SECRET_ACCESS_KEY;
  private s3;
  private storage;
  private useMulter = OPTIONS.USE_MULTER;
  private useS3 = OPTIONS.USE_S3;
  private useDigitalOceanSpaces = OPTIONS.USE_DIGITALOCEAN_SPACE;
  private useDiskStorage = OPTIONS.USE_MULTER_DISK_STORAGE;
  private s3config: S3ClientConfig = {
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  };
  private message;
  public storageType: 's3' | 'memory' | 'disk' = 'memory';

  constructor() {
    if (this.useS3) {
      this.storageType = 's3';
      if (this.useDigitalOceanSpaces) {
        this.s3config.endpoint = <any>new aws.Endpoint(CONSTANTS.DIGITALOCEAN_SPACE_ENDPOINT);
        this.message = 'FILE_STORAGE: using digital ocean space';
      } else {
        this.s3config.region = this.region;
        this.message = 'FILE_STORAGE: using aws s3';
      }
      this.s3 = new S3Client(this.s3config);
    }
    if (this.useDiskStorage) {
      this.storageType = 'disk';
      this.message = `FILE_STORAGE: using disk storage location: ${CONSTANTS.ROOT_PATH}`;
    }
    this.storage = this.useS3
      ? multerS3({
          s3: this.s3!,
          bucket: this.bucket,
          contentType: multerS3.AUTO_CONTENT_TYPE,
          acl: 'public-read',
          metadata: function (req: Express.Request, file: Express.Multer.File, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            cb(null, Date.now().toString());
          },
        })
      : this.useDiskStorage
      ? multer.diskStorage({
          destination: function (req, file, cb) {
            if (!fs.existsSync(CONSTANTS.ROOT_PATH)) {
              fs.mkdirSync(CONSTANTS.ROOT_PATH);
            }
            cb(null, CONSTANTS.ROOT_PATH);
          },
          filename: function (req, file, cb) {
            // const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            // cb(null, `${file.fieldname}-${uniqueSuffix}`);
            cb(null, file.originalname);
          },
        })
      : multer.memoryStorage();
    if (this.message) {
      logger.info([this.message]);
    } else logger.info('FILE_STORAGE: using memory storage');
  }

  async getObject(key: string) {
    const params = {
      Key: key,
      Bucket: this.bucket,
    };
    const command = new GetObjectCommand(params);
    return (await this.s3!.send(command)).Body;
  }

  async addObject(body: string, contentType: string) {
    const key = Date.now().toString();
    const params = {
      Key: key,
      Bucket: this.bucket,
      Body: Buffer.from(body, 'base64'),
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: contentType,
    };
    const command = new PutObjectCommand(params);
    await this.s3!.send(command);
    return `url${key}`;
  }

  async deleteObject(key: string | aws.S3.ObjectIdentifier[]) {
    if (this.useDiskStorage) {
      if (typeof key === 'string') {
        return fsAsync.unlink(`${CONSTANTS.ROOT_PATH}/${key}`);
      }
      return Promise.all(key.map((k) => fsAsync.unlink(`${CONSTANTS.ROOT_PATH}/${k}`)));
    }
    if (this.useS3) {
      if (typeof key === 'string') {
        const params = {
          Key: key,
          Bucket: this.bucket,
        };
        const command = new DeleteObjectCommand(params);
        return (await this.s3!.send(command)).VersionId;
        // eslint-disable-next-line no-else-return
      } else {
        const params: aws.S3.Types.DeleteObjectsRequest = {
          Bucket: this.bucket,
          Delete: {
            Objects: key,
            Quiet: true,
          },
        };
        const command = new DeleteObjectsCommand(params);
        return (await this.s3!.send(command)).Deleted;
      }
    }
    logger.info('delete memory storage unimplemented');
    return null;
  }
  // req.file
  uploadOne(fieldname: string) {
    if (!this.useMulter) {
      return (req: Express.Request, res: Express.Response, next: NextFunction) => {
        return next();
      };
    }
    return multer({
      storage: this.storage,
    }).single(fieldname);
  }

  // req.files[0]
  uploadArray(fieldname: string) {
    if (!this.useMulter) {
      return (req: Express.Request, res: Express.Response, next: NextFunction) => {
        return next();
      };
    }
    return multer({
      storage: this.storage,
    }).array(fieldname);
  }

  // req.files[name][0]
  uploadField(fieldname: { name: string; maxCount: number }[]) {
    if (!this.useMulter) {
      return (req: Express.Request, res: Express.Response, next: NextFunction) => {
        return next();
      };
    }
    return multer({
      storage: this.storage,
    }).fields(fieldname);
  }
}

export default new Multer();
