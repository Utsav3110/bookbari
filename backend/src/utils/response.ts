import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null
) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data: data !== undefined ? data : null,
  });
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T | null = null,
  statusCode = 200
) => {
  return sendResponse(res, statusCode, true, message, data);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  data: any = null
) => {
  return sendResponse(res, statusCode, false, message, data);
};
