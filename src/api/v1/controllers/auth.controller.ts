/* eslint-disable no-unused-vars */
import { Request } from 'express';
import AuthService from '@services/auth.service';
import { UserInterface } from '@interfaces/User.Interface';
import Controller from '@controllers/controller';
import { MESSAGES } from '@config';

class AuthController extends Controller<UserInterface> {
  service = new AuthService();

  login = this.control(async (req: Request) => {
    return this.service.login(req.body);
  });
  registration = this.control((req: Request) => {
    return this.service.createUser(req.body);
  });
  verifyEmail = this.control(async (req: Request) => {
    const result = await this.service.verifyEmail(req.params.token);
    return { message: 'user verified', user: result };
  });

  forgotPassword = this.control(async (req: Request) => {
    const result = await this.service.getResetToken(req.body.email);
    return { message: 'email sent', data: result };
  });

  resetPassword = this.control(async (req: Request) => {
    const result = await this.service.resetPassword(req.params.token, req.body.password);
    return { success: result };
  });

  oAuthUrls = this.control(async (req: Request) => {
    const result = await this.service.oAuthUrls();
    return result;
  });

  googleLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await this.service.googleLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  facebookLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await this.service.facebookLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  appleLogin = this.control(async (req: Request) => {
    const { code } = req.query;
    const redirectUri = await this.service.appleLogin(<string>code);
    return { redirectUri, redirect: true };
  });

  getRefreshToken = this.control((req: Request) => {
    const token = req.headers['x-refresh-token'];
    if (!token) throw new this.HttpError(MESSAGES.INVALID_REQUEST);
    return this.service.refreshAccessToken(<string>token);
  });
}

export default AuthController;
