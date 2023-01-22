/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { UserInterface } from '@interfaces/User.Interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserInterface & { _id: string };
      file?: Express.Multer.File & Express.MulterS3.File;
      files?:
        | {
            [fieldname: string]: Multer.File[] & Express.MulterS3.File[];
          }
        | Multer.File[]
        | Express.MulterS3.File[]
        | undefined;
    }
  }
}
