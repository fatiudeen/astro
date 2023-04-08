/* eslint-disable indent */
/* eslint-disable no-useless-catch */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import HttpError from '@helpers/HttpError';
import * as Config from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';
import SessionService from '@services/session.service';
import { google } from 'googleapis';
import queryString from 'qs';
import axios from 'axios';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import Emailing from '@helpers/sendGrid';
import jwt from 'jsonwebtoken';

class AuthService extends Service<UserInterface, UserRepository> {
  protected repository = new UserRepository();
  externalServices = { SessionService: new SessionService(), Emailing: new Emailing() };
  useSessions = Config.OPTIONS.USE_AUTH_SESSIONS;
  userRefreshToken = Config.OPTIONS.USE_REFRESH_TOKEN;
  useGoogle = Config.OPTIONS.USE_OAUTH_GOOGLE;
  useFacebook = Config.OPTIONS.USE_OAUTH_FACEBOOK;
  useApple = Config.OPTIONS.USE_OAUTH_APPLE;

  oAuth2Client = this.useGoogle
    ? new google.auth.OAuth2(
        Config.GOOGLE_API_CLIENT_ID,
        Config.GOOGLE_API_CLIENT_SECRET,
        `${Config.API_HOST}${Config.GOOGLE_API_REDIRECT}`,
      )
    : null;
  oauth2 = this.useGoogle ? google.oauth2('v2') : null;
  appleOptions = this.useApple
    ? {
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app',
        redirectUri: `${Config.API_HOST}${Config.APPLE_API_REDIRECT}`,
        // OPTIONAL
        state: 'state', // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
        // responseMode: 'form_post', // Force set to form_post if scope includes 'email'
        scope: 'name%20email',
        // scope: ['name', 'email'], // optional
      }
    : null;

  async login(data: { email: string; password: string }) {
    try {
      const user = await this.findOne({ email: <string>data.email }).select('+password');
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await user.comparePasswords(data.password);
      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const token = user.getSignedToken();

      // create a session
      this.observer.run('login-event', { ...user, token });
      // let session = await this.externalServices.SessionService.findOne({ userId: user._id });
      // if (session) this.externalServices.SessionService.delete(session.id);
      // session = await this.externalServices.SessionService.create({
      //   userId: user._id,
      //   token,
      //   isLoggedIn: true,
      // });
      let refreshToken;
      // if (this.userRefreshToken) {
      //   refreshToken = session.getRefreshToken!();
      // }

      return { token, user, refreshToken };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createUser(data: Partial<UserInterface>) {
    try {
      const user = await this.findOne({ email: <string>data.email }).select('+password');
      if (user) throw new HttpError(Config.MESSAGES.USER_EXISTS, 406);

      const token = generateToken();
      data.verificationToken = token;
      data.role = 'user';
      const result = await this.create(<UserInterface>data);
      this.externalServices.Emailing.verifyEmail(result);
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.findOne({
        verificationToken: token,
      });

      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 406);

      user.verifiedEmail = true;
      user.verificationToken = undefined;
      const result = await user.save();
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getResetToken(email: string) {
    try {
      let resetToken: string;
      const user = await this.findOne({ email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);
      if (!user.resetToken) {
        resetToken = generateToken();
        user.resetToken = resetToken;
        await user.save();
      } else {
        resetToken = user.resetToken;
      }
      this.externalServices.Emailing.sendResetPassword(user);
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async resetPassword(token: string, password: string) {
    try {
      const user = await this.findOne({ resetToken: token }).select('+password');

      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);
      user.password = password;
      user.resetToken = undefined;
      await user.save();
      return true;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  oAuthUrls() {
    let googleLoginUrl;
    let facebookLoginUrl;
    let appleLoginUrl;
    if (this.useGoogle) {
      googleLoginUrl = this.oAuth2Client!.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
      });
    }

    if (this.useFacebook) {
      const stringifiedParams = queryString.stringify({
        client_id: process.env.APP_ID_GOES_HERE,
        redirect_uri: `${Config.API_HOST}${<string>Config.FACEBOOK_API_REDIRECT}`,
        scope: ['email', 'user_friends'].join(','),
        response_type: 'code',
        auth_type: 'rerequest',
        display: 'popup',
      });

      facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
    }
    if (this.useApple) {
      appleLoginUrl = appleSignin.getAuthorizationUrl(this.appleOptions!);
    }
    return { googleLoginUrl, facebookLoginUrl, appleLoginUrl };
  }

  async googleLogin(code: string) {
    try {
      if (!this.oAuth2Client || !this.oauth2) return null;
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.credentials = tokens;

      const {
        // eslint-disable-next-line no-unused-vars, camelcase, object-curly-newline
        data: { email, id, given_name, family_name, picture },
      } = await this.oauth2.userinfo.v2.me.get({
        auth: this.oAuth2Client,
      });

      const user = await this.repository.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${Config.FRONTEND_GOOGLE_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async facebookLogin(code: string) {
    try {
      if (!this.useFacebook) return null;
      // eslint-disable-next-line no-unused-vars
      const { access_token, token_type, expires_in } = (
        await axios<{ access_token: string; token_type: string; expires_in: string }>({
          url: 'https://graph.facebook.com/v4.0/oauth/access_token',
          method: 'get',
          params: {
            client_id: Config.FACEBOOK_API_CLIENT_ID,
            client_secret: Config.FACEBOOK_API_CLIENT_SECRET,
            redirect_uri: `${Config.API_HOST}${Config.FACEBOOK_API_REDIRECT}`,
            code,
          },
        })
      ).data;
      // eslint-disable-next-line no-unused-vars, object-curly-newline
      const { id, email, first_name, last_name } = (
        await axios<{ id: string; email: string; first_name: string; last_name: string }>({
          url: 'https://graph.facebook.com/me',
          method: 'get',
          params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token,
          },
        })
      ).data;
      const user = await this.repository.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${Config.FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async appleLogin(code: string) {
    try {
      if (!this.useApple) return null;

      const appleClientSecret = appleSignin.getClientSecret({
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app', // Apple Client ID
        teamID: Config.APPLE_TEAM_ID || 'teamID', // Apple Developer Team ID.
        privateKey: Config.APPLE_API_CLIENT_SECRET,
        keyIdentifier: Config.APPLE_KEY_IDENTIFIER,
        // OPTIONAL
        expAfter: 15777000,
      });
      const appleGetTokenOptions = {
        clientID: Config.APPLE_API_CLIENT_ID || 'com.company.app',
        redirectUri: `${Config.API_HOST}${Config.APPLE_API_REDIRECT}`,
        clientSecret: appleClientSecret,
      };
      const { id_token } = await appleSignin.getAuthorizationToken(code, appleGetTokenOptions);

      // eslint-disable-next-line no-unused-vars
      const { email, name } = <AppleIdTokenType & { name: string }>(
        await appleSignin.verifyIdToken(id_token)
      );

      const user = await this.repository.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${Config.FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!this.userRefreshToken) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const id = (<{ id: string }>jwt.verify(refreshToken, Config.REFRESH_JWT_KEY)).id;
      const session = await this.externalServices.SessionService.findOne(id);
      if (!session) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const user = await this.findOne(<string>session.userId);
      const token = user?.getSignedToken();
      await this.externalServices.SessionService.update(session.id, { token });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;
