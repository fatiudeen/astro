/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '@helpers/HttpError';
import { MESSAGES, JWT_KEY, OPTIONS } from '@config';
import userService from '@services/auth.service';
import sessionService from '@services/session.service';

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
      const decoded = <any>jwt.verify(token, JWT_KEY);

      const user = await userService.findOne(<string>decoded.id);

      if (!user) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }

      if (userService.useSessions) {
        const session = await sessionService.findOne({ userId: user._id });
        if (!session) return next(new HttpError(MESSAGES.INVALID_SESSION, 401));
        if (session.token !== token) return next(new HttpError(MESSAGES.ACTIVE_SESSION, 401));
      }

      if (role && user.role !== role) {
        return next(new HttpError(MESSAGES.UNAUTHORIZED, 401));
      }
      req.user = user;

      if (OPTIONS.USE_DAILY_VISIT_COUNTER && !(<any>req.session).userId) {
        (<any>req.session).userId = user._id;
        req.session.save();
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
