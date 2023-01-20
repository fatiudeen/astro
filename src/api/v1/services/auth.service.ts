/* eslint-disable no-underscore-dangle */
import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import HttpError from '@helpers/HttpError';
import { MESSAGES } from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';
import SessionService from '@services/session.service';

class AuthService extends Service<UserInterface> {
  // repository = UserRepository;
  externalServices = { SessionService };
  useSessions = false;

  async login(data: { email: string; password: string }) {
    try {
      const user = await this.repository.findOne({ email: <string>data.email }).select('+password');
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
      const user = await this.repository.findOne({ email: <string>data.email }).select('+password');
      if (user) throw new HttpError(MESSAGES.USER_EXISTS, 406);

      const token = generateToken();
      data.verificationToken = token;
      data.role = 'user';
      data.session = this.useSessions;
      const result = await this.repository.create(<UserInterface>data);
      // TODO: send email
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.repository.findOne({
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
      const user = await this.repository.findOne({ email });
      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 404);
      if (!user.resetToken) {
        resetToken = generateToken();
        user.resetToken = resetToken;
        await user.save();
      } else {
        resetToken = user.resetToken;
      }
      // TODO: send email
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async resetPassword(token: string, password: string) {
    try {
      const user = await this.repository.findOne({ resetToken: token }).select('+password');

      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 404);
      user.password = password;
      user.resetToken = undefined;
      await user.save();
      return true;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export default new AuthService(UserRepository);
