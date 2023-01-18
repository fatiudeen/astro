import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '@helpers/HttpError';
import { MESSAGES, JWT_KEY } from '@config';
import User from '@models/User';

// eslint-disable-next-line import/prefer-default-export
export const authorize =
  // eslint-disable-next-line consistent-return
  (role?: string) => async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) {
      return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
    }

    try {
      const decoded = <any>jwt.verify(token, <string>JWT_KEY);

      const user = await User.findById(<string>decoded.id);

      if (!user) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      if (role && user.role !== role) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }
      req.user = user;

      return next();
    } catch (error) {
      next(error);
    }
  };
