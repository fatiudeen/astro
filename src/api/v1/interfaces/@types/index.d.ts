/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { UserInterface } from '@interfaces/User.Interface';
import { Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: UserInterface & { _id: string | Types.ObjectId };
      file?: Express.Multer.File & Express.MulterS3.File;
      files?:
        | {
            [fieldname: string]: Multer.File[] & Express.MulterS3.File[];
          }
        | Multer.File[]
        | Express.MulterS3.File[]
        | undefined;
      io: Server;
    }
  }

  type DocType<T> = T & {
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export {};
