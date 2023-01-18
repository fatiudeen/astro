import { Router } from 'express';
import { validator } from '@middlewares/validator';
import { ValidationChain } from 'express-validator';
import Controller from '@controllers/controller';

export default abstract class ClaimsRoute<T> {
  readonly router;
  abstract controller: Controller<T>;
  abstract dto: Record<string, ValidationChain[]>;
  readonly validator = validator;
  constructor() {
    this.router = Router();
  }

  abstract initRoutes(): Router;
}
