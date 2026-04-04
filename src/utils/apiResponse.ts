import { Response } from 'express';

interface ApiResponseOptions {
  message: string;
  data?: any;
  meta?: any;
}

export function sendSuccess(res: Response, statusCode: number, options: ApiResponseOptions) {
  const response: any = {
    success: true,
    message: options.message,
  };

  if (options.data !== undefined) {
    response.data = options.data;
  }

  if (options.meta !== undefined) {
    response.meta = options.meta;
  }

  return res.status(statusCode).json(response);
}

export function sendError(res: Response, statusCode: number, message: string, errors?: any) {
  const response: any = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}
