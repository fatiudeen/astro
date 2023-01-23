/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import multer from 'multer';
import aws from 'aws-sdk';
import {
  S3Client,
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
} from '@config';
import { NextFunction } from 'express';

class S3 {
  private bucket = AWS_BUCKET_NAME;
  private region = AWS_REGION;
  private accessKeyId = AWS_ACCESS_KEY_ID;
  private secretAccessKey = AWS_SECRET_ACCESS_KEY;
  private s3;
  private storage;
  private useS3 = OPTIONS.USE_S3;
  constructor() {
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
    this.storage = multerS3({
      s3: this.s3,
      bucket: this.bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'public-read',
      metadata: function (req: Express.Request, file: Express.Multer.File, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString());
      },
    });
  }

  // fileFilter (req, res, cb:) {
  //     if (file.mimetype ==='image/jpeg' || file.mimetype === 'image/png' ){
  //         cb(null, true)
  //     }else{
  //         cb(err, false)
  //     }
  // }

  async getObject(key: string) {
    const params = {
      Key: key,
      Bucket: this.bucket,
    };
    const command = new GetObjectCommand(params);
    return (await this.s3.send(command)).Body;
  }

  async addObject(key: string, body: Blob) {
    const params = {
      Key: key,
      Bucket: this.bucket,
      Body: body,
    };
    const command = new PutObjectCommand(params);
    return (await this.s3.send(command)).VersionId;
  }

  async deleteObject(key: string | aws.S3.ObjectIdentifier[]) {
    if (typeof key === 'string') {
      const params = {
        Key: key,
        Bucket: this.bucket,
      };
      const command = new DeleteObjectCommand(params);
      return (await this.s3.send(command)).VersionId;
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
      return (await this.s3.send(command)).Deleted;
    }
  }
  // req.file
  uploadOne(fieldname: string) {
    if (!this.useS3) {
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
    if (!this.useS3) {
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
    if (!this.useS3) {
      return (req: Express.Request, res: Express.Response, next: NextFunction) => {
        return next();
      };
    }
    return multer({
      storage: this.storage,
    }).fields(fieldname);
  }
}
export default new S3();
