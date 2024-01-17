/* eslint-disable no-unused-vars */
import { Request } from 'express';
import AuthService from '@services/auth.service';
import Controller from '@controllers/controller';
import { MESSAGES } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import { AuthResponseDTO } from '@dtos/auth.dto';

class AuthController extends Controller<AuthSessionInterface> {
  responseDTO = undefined;
  service = new AuthService();

  login = this.control(async (req: Request) => {
    return this.service.login(req.body);
  }, AuthResponseDTO.login);

  registration = this.control((req: Request) => {
    return this.service.createUser(req.body);
  }, AuthResponseDTO.signUp);

  verifyEmail = this.control(async (req: Request) => {
    const result = await this.service.verifyEmail(req.params.token);
    return result;
  }, AuthResponseDTO.User);

  resendVerifyEmail = this.control(async (req: Request) => {
    const result = await this.service.ResendVerificationEmail(req.body);
    return result;
  }, undefined);

  forgotPassword = this.control(async (req: Request) => {
    await this.service.getResetToken(req.body.email);
    return { _message: 'Email Sent' };
  }, undefined);

  resetPassword = this.control(async (req: Request) => {
    await this.service.resetPassword(req.params.token, req.body.password);
    return { _message: 'Reset Successful' };
  }, undefined);

  oAuthUrls = this.control(async (req: Request) => {
    const result = await this.service.oAuthUrls(<string>req.query.state);
    return result;
  }, undefined);

  googleLogin = this.control(async (req: Request) => {
    const { code, state } = req.query;
    const redirectUri = await this.service.googleLogin(<string>code, <string>state);
    return { redirectUri, redirect: true };
  });

  getRefreshToken = this.control((req: Request) => {
    const token = req.headers['x-refresh-token'];
    if (!token) throw new this.HttpError(MESSAGES.INVALID_REQUEST);
    return this.service.refreshAccessToken(<string>token);
  }, undefined);
}

export default AuthController;
