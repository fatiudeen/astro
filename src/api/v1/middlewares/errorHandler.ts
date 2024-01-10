/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import HttpError from '@helpers/HttpError';

// eslint-disable-next-line import/prefer-default-export
export const errorHandler = (err: HttpError | Error, req: Request, res: Response, next: NextFunction) => {
  let error: any;

  if (typeof err === 'object') error = { ...err };
  else if (typeof err === 'string') error.message = err;
  error.message = err.message;

  let statusCode: number;
  if ('statusCode' in error) {
    statusCode = error.statusCode;
  } else {
    statusCode = 500;
  }

  if (error.name == 'TokenExpiredError' || error.name == 'JsonWebTokenError') {
    statusCode = 401;
  }

  // if ((error.code = 11000)) {
  //   const key = Object.keys(error.keyValue)[0];
  //   const value = Object.values(error.keyValue)[0];
  //   statusCode = 400;
  //   error.message = `duplicate ${key}: ${value}`;
  // }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    error,
  });
};
