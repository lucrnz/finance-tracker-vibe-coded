import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { signUpSchema, signInSchema } from './auth.schemas.js';
import { authService } from './auth.service.js';
import type { SignUpInput, SignInInput } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/signup', validate(signUpSchema), async (req, res, next) => {
  try {
    const input = req.body as SignUpInput;
    const result = await authService.signUp(input);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/signin', validate(signInSchema), async (req, res, next) => {
  try {
    const input = req.body as SignInInput;
    const result = await authService.signIn(input);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
