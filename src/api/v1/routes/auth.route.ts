/* eslint-disable import/no-unresolved */
import authController from '@controllers/auth.controller';
import authDto from '@dtos/auth.dto';
import Route from '@routes/route';
import { UserInterface } from '@interfaces/User.Interface';

class AuthRoute extends Route<UserInterface> {
  controller = authController;
  dto = authDto;
  initRoutes() {
    this.router.post('/signin', this.validator(this.dto.login), this.controller.login);
    this.router
      .route('/signup')
      .post(this.validator(this.dto.register), this.controller.registration);
    this.router
      .route('/verifyEmail')
      .get(this.validator(this.dto.email), this.controller.verifyEmail);

    this.router
      .route('/forgotPassword')
      .post(this.validator(this.dto.email), this.controller.forgotPassword);
    this.router
      .route('/resetPassword/:token')
      .post(this.validator(this.dto.password), this.controller.resetPassword);

    return this.router;
  }
}

export default new AuthRoute();
