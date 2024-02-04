import supertest from 'supertest';
import App from '../app';
import AuthService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';
import * as Config from '@config';

import { validUser, invalidEmail, invalidPassword } from './data/user';
import { logger } from '@utils/logger';
jest.mock('googleapis');

logger.silent = true;

const deepLog = (data: any) => {
  console.dir(data, { depth: null });
};

const authService = new AuthService();
const app = new App().instance();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authorization ::', () => {
  describe('login ==========>>>>', () => {
    describe('given a valid email and password', () => {
      it('should send otp return 201', async () => {
        await authService.createUser({ ...validUser });

        const { statusCode, body } = await supertest(app)
          .post('/api/v1/signin')
          .send({ username: validUser.email, password: validUser.password });

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        expect(mailMock).toHaveBeenCalled();
      });
    });

    describe('given an invalid email', () => {
      it('should return 401', async () => {
        await authService.createUser({ ...validUser });

        const { statusCode, body } = await supertest(app)
          .post('/api/v1/signin')
          .send({ username: invalidEmail, password: validUser.password });

        expect(statusCode).toBe(401);
        expect(body.success).toEqual(false);
      });
    });

    describe('given an invalid password', () => {
      it('should return 401', async () => {
        await authService.createUser({ ...validUser });

        const { statusCode, body } = await supertest(app)
          .post('/api/v1/signin')
          .send({ username: validUser.email, password: invalidPassword });

        expect(statusCode).toBe(401);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe('sign up  ==========>>>>', () => {
    describe('given a valid email and password', () => {
      it('should return 201', async () => {
        const { statusCode, body } = await supertest(app)
          .post('/api/v1/signup')
          .send({ ...validUser });

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe('verify otp  ==========>>>>', () => {
    describe('given a valid otp', () => {
      it('should verify otp, sends jwt and return 201', async () => {
        const user = await authService.createUser({ ...validUser });
        await authService.login({ username: validUser.email, password: validUser.password });
        // const otp = mailMock.mock.calls[0][1].split(' ').pop();

        const { statusCode, body } = await supertest(app).get(
          `/api/v1/verifyEmail?token=${user.verificationToken}&email=${validUser.email}`,
        );

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data.verifiedEmail).toEqual(true);
      });
    });
  });
  describe('forgot password  ==========>>>>', () => {
    describe('given a user forgot auth password', () => {
      it('should send otp and return 201', async () => {
        await authService.createUser({ ...validUser });

        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/forgotPassword`)
          .send({ email: validUser.email });

        // deepLog(body);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        expect(body.data._message).toEqual('Email Sent');
        expect(mailMock).toHaveBeenCalled();
      });
    });
  });
  describe('resend email verification ==========>>>>', () => {
    describe('given a users unverified email address', () => {
      it('should resend verification otp and return 201', async () => {
        await authService.createUser({ ...validUser });

        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/resendVerifyEmail`)
          .send({ email: validUser.email });

        // deepLog(body);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        expect(body.data.info).toEqual('Email Sent');
        expect(mailMock).toHaveBeenCalled();
      });
    });
    describe('given a users verified email address', () => {
      it('should resend verification otp and return 201', async () => {
        const user = await authService.createUser({ ...validUser });
        await authService.verifyEmail(user.verificationToken as string, user.email);

        mailMock.mockClear();
        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/resendVerifyEmail`)
          .send({ email: validUser.email });

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
        expect(mailMock).not.toHaveBeenCalled();
      });
    });
    describe('given a invalid email address', () => {
      it('should resend verification otp and return 201', async () => {
        await authService.createUser({ ...validUser });

        mailMock.mockClear();
        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/resendVerifyEmail`)
          .send({ email: invalidEmail });

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
        expect(mailMock).not.toHaveBeenCalled();
      });
    });
  });
  describe('reset password ==========>>>>', () => {
    describe('given a valid otp and email', () => {
      it('should verify otp, sends jwt and return 201', async () => {
        await authService.createUser({ ...validUser });
        await authService.getResetToken(validUser.email);
        const otp = (mailMock.mock.calls[1][2] as { token: string }).token;

        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/resetPassword/${otp}`)
          .send({ password: 'randomPassword', confirmPassword: 'randomPassword' });

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe('generate oAuth uri ==========>>>>', () => {
    // it('should return oauth url and return 200', async () => {
    //   //     googleapisMock.auth.OAuth2.mockImplementation(() => ({
    //   //     generateAuthUrl: jest.fn(() => 'your-generated-auth-url'),
    //   //     getToken: jest.fn(() => ({ tokens: 'mockTokens' })),
    //   //   }));
    //   const { statusCode, body } = await supertest(app).get(`/api/v1/oAuthUrls?state=http://test.com`);
    //   deepLog(body);
    //   expect(statusCode).toBe(200);
    //   expect(body.success).toEqual(true);
    //   expect(body.data.verifiedEmail).toEqual(true);
    // });
  });
  describe('convert google code to token ==========>>>>', () => {
    describe('given a valid otp', () => {
      //   it('should verify otp, sends jwt and return 201', async () => {
      //     const code = '12345';
      //     const state = 'http://localho.st:5000';
      //     const { statusCode, body } = await supertest(app).get(`/api/v1/google?state=${state}&code=${code}`);
      //     expect(statusCode).toBe(200);
      //     expect(body.success).toEqual(true);
      //     expect(body.data.verifiedEmail).toEqual(true);
      //   });
    });
  });
  describe('get access token using refresh token ==========>>>>', () => {
    describe('given a valid refresh token', () => {
      if (Config.OPTIONS.USE_REFRESH_TOKEN) {
        it('should sends jwt and return 201', async () => {
          await authService.createUser({ ...validUser });
          const user = await authService.login({ username: validUser.email, password: validUser.password });

          const { statusCode, body } = await supertest(app)
            .get('/api/v1/refreshToken')
            .set('x-refresh-token', user.refreshToken!);

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
          expect(body.data).toHaveProperty('token');
        });
      } else {
        it('should always return true', async () => {
          expect(true).toBe(true);
        });
      }
    });
  });
});
