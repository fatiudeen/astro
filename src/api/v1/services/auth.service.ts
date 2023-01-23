/* eslint-disable no-useless-catch */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import HttpError from '@helpers/HttpError';
import {
  GOOGLE_API_CLIENT_ID,
  MESSAGES,
  GOOGLE_API_CLIENT_SECRET,
  GOOGLE_API_REDIRECT,
  FACEBOOK_API_REDIRECT,
  API_HOST,
  FRONTEND_GOOGLE_LOGIN_URI,
  FRONTEND_FACEBOOK_LOGIN_URI,
  APPLE_API_CLIENT_ID,
  APPLE_API_REDIRECT,
  APPLE_API_CLIENT_SECRET,
  APPLE_TEAM_ID,
  APPLE_KEY_IDENTIFIER,
  OPTIONS,
  FACEBOOK_API_CLIENT_ID,
  FACEBOOK_API_CLIENT_SECRET,
  REFRESH_JWT_KEY,
} from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';
import SessionService from '@services/session.service';
import { google } from 'googleapis';
import queryString from 'qs';
import axios from 'axios';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import Emailing from '@helpers/Emailing';
import jwt from 'jsonwebtoken';

class AuthService extends Service<UserInterface> {
  // repository = UserRepository;
  externalServices = { SessionService, Emailing };
  useSessions = OPTIONS.USE_AUTH_SESSIONS;
  userRefreshToken = OPTIONS.USE_REFRESH_TOKEN;
  useGoogle = OPTIONS.USE_OAUTH_GOOGLE;
  useFacebook = OPTIONS.USE_OAUTH_FACEBOOK;
  useApple = OPTIONS.USE_OAUTH_APPLE;

  oAuth2Client = new google.auth.OAuth2(
    GOOGLE_API_CLIENT_ID,
    GOOGLE_API_CLIENT_SECRET,
    `${API_HOST}${GOOGLE_API_REDIRECT}`,
  );
  oauth2 = google.oauth2('v2');
  appleOptions = {
    clientID: APPLE_API_CLIENT_ID || 'com.company.app',
    redirectUri: `${API_HOST}${APPLE_API_REDIRECT}`,
    // OPTIONAL
    state: 'state', // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
    // responseMode: 'form_post', // Force set to form_post if scope includes 'email'
    scope: 'name%20email',
    // scope: ['name', 'email'], // optional
  };
  appleClientSecret = appleSignin.getClientSecret({
    clientID: APPLE_API_CLIENT_ID || 'com.company.app', // Apple Client ID
    teamID: APPLE_TEAM_ID || 'teamID', // Apple Developer Team ID.
    privateKey: APPLE_API_CLIENT_SECRET,
    keyIdentifier: APPLE_KEY_IDENTIFIER,
    // OPTIONAL
    expAfter: 15777000,
  });
  appleGetTokenOptions = {
    clientID: APPLE_API_CLIENT_ID || 'com.company.app',
    redirectUri: `${API_HOST}${APPLE_API_REDIRECT}`,
    clientSecret: this.appleClientSecret,
  };

  async login(data: { email: string; password: string }) {
    try {
      const user = await this.findOne({ email: <string>data.email }).select('+password');
      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await user.comparePasswords(data.password);
      if (!isMatch) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const token = user.getSignedToken();

      // create a session
      let session = await this.externalServices.SessionService.findOne({ userId: user._id });
      if (session) this.externalServices.SessionService.delete(session.id);
      session = await this.externalServices.SessionService.create({
        userId: user._id,
        token,
        isLoggedIn: true,
      });
      let refreshToken;
      if (this.userRefreshToken) {
        refreshToken = session.getRefreshToken!();
      }

      return { token, user, refreshToken };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createUser(data: Partial<UserInterface>) {
    try {
      const user = await this.findOne({ email: <string>data.email }).select('+password');
      if (user) throw new HttpError(MESSAGES.USER_EXISTS, 406);

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

      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 406);

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
      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 404);
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

      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 404);
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
      googleLoginUrl = this.oAuth2Client.generateAuthUrl({
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
        redirect_uri: `${API_HOST}${<string>FACEBOOK_API_REDIRECT}`,
        scope: ['email', 'user_friends'].join(','),
        response_type: 'code',
        auth_type: 'rerequest',
        display: 'popup',
      });

      facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
    }
    if (this.useApple) {
      appleLoginUrl = appleSignin.getAuthorizationUrl(this.appleOptions);
    }
    return { googleLoginUrl, facebookLoginUrl, appleLoginUrl };
  }

  async googleLogin(code: string) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.credentials = tokens;

      const {
        // eslint-disable-next-line no-unused-vars, camelcase, object-curly-newline
        data: { email, id, given_name, family_name, picture },
      } = await this.oauth2.userinfo.v2.me.get({
        auth: this.oAuth2Client,
      });

      const user = await this.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${FRONTEND_GOOGLE_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async facebookLogin(code: string) {
    try {
      // eslint-disable-next-line no-unused-vars
      const { access_token, token_type, expires_in } = (
        await axios<{ access_token: string; token_type: string; expires_in: string }>({
          url: 'https://graph.facebook.com/v4.0/oauth/access_token',
          method: 'get',
          params: {
            client_id: FACEBOOK_API_CLIENT_ID,
            client_secret: FACEBOOK_API_CLIENT_SECRET,
            redirect_uri: `${API_HOST}${FACEBOOK_API_REDIRECT}`,
            code,
          },
        })
      ).data;
      // console.log(data); // { access_token, token_type, expires_in }
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
      const user = await this.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async appleLogin(code: string) {
    try {
      const { id_token } = await appleSignin.getAuthorizationToken(code, this.appleGetTokenOptions);

      // eslint-disable-next-line no-unused-vars
      const { email, name } = <AppleIdTokenType & { name: string }>(
        await appleSignin.verifyIdToken(id_token)
      );

      const user = await this.upsert({ email: <string>email }, { email: <string>email });
      const token = user!.getSignedToken();
      return `${FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!this.userRefreshToken) throw new Error(MESSAGES.INVALID_SESSION);
      const id = (<{ id: string }>jwt.verify(refreshToken, REFRESH_JWT_KEY)).id;
      const session = await this.externalServices.SessionService.findOne(id);
      if (!session) throw new Error(MESSAGES.INVALID_SESSION);
      const user = await this.findOne(<string>session.userId);
      const token = user?.getSignedToken();
      await this.externalServices.SessionService.update(session.id, { token });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService(UserRepository);
