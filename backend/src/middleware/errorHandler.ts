import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error)
  
  const statusCode = error.statusCode || 500
  const message = error.isOperational ? error.message : 'Internal server error'
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}
