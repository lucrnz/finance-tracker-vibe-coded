import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodTypeDef } from 'zod';

export const validate = <T>(schema: ZodSchema<T, ZodTypeDef, unknown>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
};
