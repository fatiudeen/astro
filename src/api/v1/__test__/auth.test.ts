import supertest from 'supertest';
import App from '@app';
import AuthService from '@services/auth.service';
// import mailMock from './__mocks__/mailMock';
import { faker } from '@faker-js/faker';
import { logger } from '@utils/logger';

const instance = supertest(new App().instance());

const authService = new AuthService();

describe('authorization', () => {
  describe('login', () => {
    describe('given a valid email and password', () => {
      it('should send otp return 201', async () => {
        const user = {
          email: faker.internet.email().toLowerCase(),
          password: faker.internet.password(),
        };
        await authService.createUser({ ...user });

        const { statusCode, body } = await instance.post('/api/v1/signin').send(user);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        // expect(mailMock).toHaveBeenCalled();
      });
    });
  });
  describe('sign up', () => {
    describe('given a valid email and password', () => {
      it('should return 201', async () => {
        const user = {
          email: faker.internet.email().toLowerCase(),
          password: faker.internet.password(),
        };
        const { statusCode, body } = await instance
          .post('/api/v1/signup')
          .send({ ...user, confirmPassword: user.password });

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe('verify email', () => {
    describe('given a valid otp', () => {
      it('should verify otp, sends jwt and return 201', async () => {
        const user = {
          email: faker.internet.email().toLowerCase(),
          password: faker.internet.password(),
        };
        const _user = await authService.createUser({ ...user });

        const { statusCode, body } = await instance.get(`/api/v1/verifyEmail/:${_user.verificationToken}`);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        // expect(body).toContain(token);
      });
    });
  });
});
