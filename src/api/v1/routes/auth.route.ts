/* eslint-disable import/no-unresolved */
import AuthController from '@controllers/auth.controller';
import { authRequestDTO } from '@dtos/auth.dto';
import Route from '@routes/route';
import { GOOGLE_API_REDIRECT, APPLE_API_REDIRECT, FACEBOOK_API_REDIRECT } from '@config';
import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';

class AuthRoute extends Route<AuthSessionInterface> {
  controller = new AuthController('authSession');
  dto = authRequestDTO;

  initRoutes() {
    this.router.post('/signin', this.validator(this.dto.login), this.controller.login);
    this.router.route('/signup').post(this.validator(this.dto.register), this.controller.registration);
    this.router.route('/verifyEmail').get(this.validator(this.dto.email), this.controller.verifyEmail);

    this.router.route('/forgotPassword').post(this.validator(this.dto.email), this.controller.forgotPassword);
    this.router.route('/resetPassword/:token').post(this.validator(this.dto.password), this.controller.resetPassword);
    this.router.route('/oAuthUrls').get(this.controller.oAuthUrls);
    this.router.route(`/${<string>APPLE_API_REDIRECT}`).post(this.validator(this.dto.code), this.controller.appleLogin);
    this.router
      .route(`/${<string>FACEBOOK_API_REDIRECT}`)
      .post(this.validator(this.dto.code), this.controller.facebookLogin);
    this.router
      .route(`/${<string>GOOGLE_API_REDIRECT}`)
      .post(this.validator(this.dto.code), this.controller.googleLogin);
    this.router.route('/refreshToken').get(this.controller.getRefreshToken);

    return this.router;
  }
}

export default AuthRoute;
