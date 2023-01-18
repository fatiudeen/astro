/* eslint-disable no-unused-vars */
import { UserInterface } from '@interfaces/User.Interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserInterface;
    }
  }
}
