import { Request, Response, NextFunction } from 'express';
import HttpResponse from '@helpers/HttpResponse';
import authService from '@services/auth.service';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';

class AuthController extends Controller<UserInterface> {
  service = authService;

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body);
      HttpResponse.send(res, result);
    } catch (error) {
      next(error);
    }
  };

  registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createUser(req.body);
      HttpResponse.send(res, result);
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyEmail(req.params.token);
      HttpResponse.send(res, { message: 'user verified', user: result });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.getResetToken(req.body.email);
      HttpResponse.send(res, { message: 'email sent', data: result });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(req.params.token, req.body.password);
      HttpResponse.send(res, { success: result });
    } catch (error) {
      next(error);
    }
  };

  oAuthUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = authService.oAuthUrls();
      HttpResponse.send(res, { success: result });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.query;
      const redirectUri = await authService.googleLogin(<string>code);
      res.redirect(redirectUri);
    } catch (error) {
      next(error);
    }
  };

  facebookLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.query;
      const redirectUri = await authService.facebookLogin(<string>code);
      res.redirect(redirectUri);
    } catch (error) {
      next(error);
    }
  };

  appleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.query;
      const redirectUri = await authService.appleLogin(<string>code);
      res.redirect(redirectUri);
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController('user');
