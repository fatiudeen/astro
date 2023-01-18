import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import HttpError from '@helpers/HttpError';
import { MESSAGES } from '@config';
import generateToken from '@utils/generateToken';
import Service from '@services/service';

class AuthService extends Service<UserInterface> {
  userRepository = UserRepository;
  async login(data: { email: string; password: string }) {
    try {
      const user = await this.userRepository
        .findOne({ email: <string>data.email })
        .select('+password');
      if (!user) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const isMatch = await user.comparePasswords(data.password);
      if (!isMatch) throw new HttpError(MESSAGES.INVALID_CREDENTIALS, 401);
      const token = user.getSignedToken();
      return { token, user };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createUser(data: Partial<UserInterface>) {
    try {
      const user = await this.userRepository
        .findOne({ email: <string>data.email })
        .select('+password');
      if (user) throw new HttpError(MESSAGES.USER_EXISTS, 406);

      const token = generateToken();
      data.verificationToken = token;
      data.role = 'user';
      const result = await this.userRepository.create(<UserInterface>data);
      // TODO: send email
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.userRepository.findOne({
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
      const user = await this.userRepository.findOne({ email });
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
      const user = await this.userRepository.findOne({ resetToken: token }).select('+password');

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
