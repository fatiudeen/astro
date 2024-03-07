/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import HttpError from '@helpers/HttpError';
import { AxiosError } from 'axios';

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

  if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
    statusCode = 401;
  }

  // if ((error.code = 11000)) {
  //   const key = Object.keys(error.keyValue)[0];
  //   const value = Object.values(error.keyValue)[0];
  //   statusCode = 400;
  //   error.message = `duplicate ${key}: ${value}`;
  // }

  if (error.name === 'AxiosError') {
    const _error: AxiosError = error;
    let _message;
    if (_error.message) {
      _message = _error.message;
    } else if (_error.response) {
      if (typeof _error.response.data === 'object') {
        const message = <any>_error.response.data;
        _message = message.message;
      } else _message = <string>_error.response.data;
    } else if (_error.request) {
      if (typeof _error.request.data === 'object') {
        const message = <any>_error.request.data;
        _message = message.message;
      } else _message = <string>_error.request.data;
    }
    statusCode = _error.response?.status || 400;
    error = { message: _message };
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    error,
  });
};
