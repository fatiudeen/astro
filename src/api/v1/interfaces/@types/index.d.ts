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

  type PopulateType = {
    path: string;
    model: string;
    select?: string;
    populate?: PopulateType | PopulateType[];
  };

  type OptionsParser<T> = {
    sort?: { [key in keyof DocType<T>]?: 1 | -1 };
    limit?: number;
    projection?: [keyof DocType<T>];
    populate?: [keyof DocType<T>] | PopulateType;
    skip?: number;
    and?: Array<DocType<T>>;
    or?: Array<DocType<T>>;
    in?: { query: [keyof DocType<T>]; in: Array<string> };
    all?: { query: [keyof DocType<T>]; all: Array<string> };
  };
}

export {};
