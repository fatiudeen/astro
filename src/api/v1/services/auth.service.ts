/* eslint-disable indent */
/* eslint-disable no-useless-catch */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { UserInterface } from '@interfaces/User.Interface';
import HttpError from '@helpers/HttpError';
import * as Config from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';
import AuthSessionRepository from '@repositories/AuthSession.repository';
import { google } from 'googleapis';
import Emailing from '@helpers/mailer';
import jwt from 'jsonwebtoken';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import UserService from '@services/user.service';
// import bcrypt from 'bcrypt';
import { logger } from '@utils/logger';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

class AuthService extends Service<AuthSessionInterface, AuthSessionRepository> {
  protected repository = new AuthSessionRepository();
  private readonly _userService = Service.instance(UserService);
  private readonly _emailing = Emailing;
  // externalServices = { SessionService: new SessionService(), Emailing: new Emailing() };
  useSessions = Config.OPTIONS.USE_AUTH_SESSIONS;
  userRefreshToken = Config.OPTIONS.USE_REFRESH_TOKEN;
  useGoogle = Config.OPTIONS.USE_OAUTH_GOOGLE;

  oAuth2Client = this.useGoogle
    ? new google.auth.OAuth2(
        Config.GOOGLE_API_CLIENT_ID,
        Config.GOOGLE_API_CLIENT_SECRET,
        `${Config.API_HOST}${Config.GOOGLE_API_REDIRECT}`,
      )
    : null;
  oauth2 = this.useGoogle ? google.oauth2('v2') : null;

  async login(data: { email: string; password: string }) {
    try {
      const user = await this._userService().findOne({ email: <string>data.email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await this.comparePasswords(data.password, user);
      if (!isMatch) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 401);
      const token = this.getSignedToken(user);

      // create a session
      let session = await this.findOne({ userId: user._id });
      if (session) this.delete(session._id);
      session = await this.create({
        userId: user._id,
        token,
        isLoggedIn: true,
      });
      let refreshToken;
      if (this.userRefreshToken) {
        refreshToken = this.getRefreshToken(session);
      }

      return { token, user, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async createUser(data: Partial<UserInterface>) {
    try {
      const user = await this._userService().findOne({ email: <string>data.email });
      if (user) throw new HttpError(Config.MESSAGES.USER_EXISTS, 406);

      const token = generateToken();
      data.verificationToken = token;
      data.role = 'user';
      data.password = await this.toHash(data.password!);
      const result = await this._userService().create(data);
      this._emailing ? this._emailing.verifyEmail(result) : logger.info(['email not enabled']);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this._userService().findOne({
        verificationToken: token,
      });

      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 406);
      const result = await this._userService().update(user._id, { verifiedEmail: true, verificationToken: undefined });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getResetToken(email: string) {
    try {
      let resetToken: string;
      const user = await this._userService().findOne({ email });
      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);
      if (!user.resetToken) {
        await this._userService().update(user._id, { resetToken: generateToken() });
      } else {
        resetToken = user.resetToken;
      }
      this._emailing ? this._emailing.sendResetPassword(user) : logger.info(['email not enabled']);
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(token: string, password: string) {
    try {
      const user = await this._userService().findOne({ resetToken: token });

      if (!user) throw new HttpError(Config.MESSAGES.INVALID_CREDENTIALS, 404);
      await this._userService().update(user._id, { resetToken: undefined, password: password });
      return;
    } catch (error) {
      throw error;
    }
  }
  oAuthUrls(state: string) {
    let googleLoginUrl;
    let facebookLoginUrl;
    let appleLoginUrl;
    if (this.useGoogle) {
      googleLoginUrl = this.oAuth2Client!.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        state,
      });
    }

    return { googleLoginUrl };
  }

  async googleLogin(code: string, state: string) {
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

      const user = await this._userService().update(
        { email: <string>email },
        {
          email: <string>email,
          firstName: given_name!,
          lastName: family_name!,
          avatar: picture || '',
          role: 'user',
          $setOnInsert: {
            fromOauth: false,
            verifiedEmail: true,
          },
        },
        true,
      );
      const token = this.getSignedToken(user!);
      return `${state}?token=${token}`;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!this.userRefreshToken) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const id = (<{ id: string }>jwt.verify(refreshToken, Config.REFRESH_JWT_KEY)).id;
      const session = await this.findOne(id);
      if (!session) throw new Error(Config.MESSAGES.INVALID_SESSION);
      const user = await this._userService().findOne(<string>session.userId);
      const token = this.getSignedToken(user!);
      await this.update(session._id, { token });
      return { token };
    } catch (error) {
      throw error;
    }
  }

  getSignedToken(user: DocType<UserInterface>) {
    return jwt.sign({ id: user._id }, Config.JWT_KEY, { expiresIn: Config.JWT_TIMEOUT });
  }

  async newSession(user: UserInterface & { _id: string; token: string }) {
    let session = await this.findOne({ userId: user._id });
    if (session) this.delete(session._id);
    session = await this.create({
      userId: user._id,
      token: user.token,
      isLoggedIn: true,
    });
  }
  getRefreshToken = (session: DocType<AuthSessionInterface>) => {
    return jwt.sign({ id: session._id }, Config.REFRESH_JWT_KEY, { expiresIn: Config.REFRESH_JWT_TIMEOUT });
  };

  toHash = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
  };

  comparePasswords = async (password: string, user: UserInterface) => {
    const [hashPassword, salt] = user.password.split('.');
    const buf = <Buffer>await promisify(scrypt)(password, salt, 64);
    return buf.toString('hex') === hashPassword;
  };
}

export default AuthService;
