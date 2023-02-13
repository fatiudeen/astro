/* eslint-disable no-unused-vars */
import { Request } from 'express';
import authService from '@services/auth.service';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { MESSAGES } from '@config';

class AuthController extends Controller<UserInterface> {
  service = authService;

  login = this.control(async (req: Request) => {
    return this.service.login(req.body);
  });
  registration = this.control((req: Request) => {
    return this.service.createUser(req.body);
  });
  verifyEmail = this.control(async (req: Request) => {
    const result = await authService.verifyEmail(req.params.token);
    return { message: 'user verified', user: result };
  });

  forgotPassword = this.control(async (req: Request) => {
    const result = await authService.getResetToken(req.body.email);
    return { message: 'email sent', data: result };
  });

  resetPassword = this.control(async (req: Request) => {
    const result = await authService.resetPassword(req.params.token, req.body.password);
    return { success: result };
  });

  oAuthUrls = this.control(async (req: Request) => {
    const result = await authService.oAuthUrls();
    return result;
  });

  googleLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await authService.googleLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  facebookLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await authService.facebookLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  appleLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await authService.appleLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  getRefreshToken = this.control((req: Request) => {
    const token = req.headers['x-refresh-token'];
    if (!token) throw new this.HttpError(MESSAGES.INVALID_REQUEST);
    return authService.refreshAccessToken(<string>token);
  });
}

export default new AuthController('user');
