import supertest from 'supertest';
import app from '../app';
import authService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';

import { user } from './__mocks__/testdata';

describe('authorization', () => {
  describe('login', () => {
    describe('given a valid email and password', () => {
      it('should send otp return 201', async () => {
        await authService.signUp(user);

        const { statusCode, body } = await supertest(app).post('/api/v1/auth/login').send(user);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        expect(mailMock).toHaveBeenCalled();
      });
    });
  });
  describe('sign up', () => {
    describe('given a valid email and password', () => {
      it('should return 201', async () => {
        const { statusCode, body } = await supertest(app).post('/api/v1/auth/sign-up').send(user);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe('verify otp', () => {
    describe('given a valid otp', () => {
      it('should verify otp, sends jwt and return 201', async () => {
        await authService.signUp(user);
        await authService.login(user);
        const otp = mailMock.mock.calls[0][1].split(' ').pop();

        const { statusCode, body } = await supertest(app)
          .post('/api/v1/auth/verify-otp')
          .send({ otp });

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
        // expect(body).toContain(token);
      });
    });
  });
});
