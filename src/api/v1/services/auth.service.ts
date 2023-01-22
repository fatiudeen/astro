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
} from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';
import SessionService from '@services/session.service';
import { google } from 'googleapis';
import queryString from 'qs';
import axios from 'axios';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import Emailing from '@helpers/Emailing';

class AuthService extends Service<UserInterface> {
  // repository = UserRepository;
  externalServices = { SessionService, Emailing };
  useSessions = false;

  oAuth2Client = new google.auth.OAuth2(
    <string>GOOGLE_API_CLIENT_ID,
    <string>GOOGLE_API_CLIENT_SECRET,
    `${<string>API_HOST}${<string>GOOGLE_API_REDIRECT}`,
  );
  oauth2 = google.oauth2('v2');
  appleOptions = {
    clientID: APPLE_API_CLIENT_ID || 'com.company.app',
    redirectUri: `${<string>API_HOST}${<string>APPLE_API_REDIRECT}`,
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
    keyIdentifier: <string>APPLE_KEY_IDENTIFIER,
    // OPTIONAL
    expAfter: 15777000,
  });
  appleGetTokenOptions = {
    clientID: APPLE_API_CLIENT_ID || 'com.company.app',
    redirectUri: `${<string>API_HOST}${<string>APPLE_API_REDIRECT}`,
    clientSecret: this.appleClientSecret,
  };

  async login(data: { email: string; password: string }) {
    try {
      const user = await this.findOne({ email: <string>data.email }).select('+password');
      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await user.comparePasswords(data.password);
      if (!isMatch) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const token = user.getSignedToken();
      if (this.useSessions) {
        const session = await this.externalServices.SessionService.findOne({ userId: user._id });
        if (session) this.externalServices.SessionService.delete(session.id);
        await this.externalServices.SessionService.create({
          userId: user._id,
          token,
          isLoggedIn: true,
        });
      }
      return { token, user };
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
      data.session = this.useSessions;
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
    const googleLoginUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
    const stringifiedParams = queryString.stringify({
      client_id: process.env.APP_ID_GOES_HERE,
      redirect_uri: `${<string>API_HOST}${<string>FACEBOOK_API_REDIRECT}`,
      scope: ['email', 'user_friends'].join(','),
      response_type: 'code',
      auth_type: 'rerequest',
      display: 'popup',
    });

    const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
    const appleLoginUrl = appleSignin.getAuthorizationUrl(this.appleOptions);
    return { googleLoginUrl, facebookLoginUrl, appleLoginUrl };
  }

  async googleLogin(code: string) {
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
  }

  async facebookLogin(code: string) {
    // eslint-disable-next-line no-unused-vars
    const { access_token, token_type, expires_in } = (
      await axios<{ access_token: string; token_type: string; expires_in: string }>({
        url: 'https://graph.facebook.com/v4.0/oauth/access_token',
        method: 'get',
        params: {
          client_id: process.env.APP_ID_GOES_HERE,
          client_secret: process.env.APP_SECRET_GOES_HERE,
          redirect_uri: `${<string>API_HOST}${<string>FACEBOOK_API_REDIRECT}`,
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
  }

  async appleLogin(code: string) {
    const { id_token } = await appleSignin.getAuthorizationToken(code, this.appleGetTokenOptions);

    // eslint-disable-next-line no-unused-vars
    const { email, name } = <AppleIdTokenType & { name: string }>(
      await appleSignin.verifyIdToken(id_token)
    );

    const user = await this.upsert({ email: <string>email }, { email: <string>email });
    const token = user!.getSignedToken();
    return `${FRONTEND_FACEBOOK_LOGIN_URI}?token=${token}`;
  }
}

export default new AuthService(UserRepository);
