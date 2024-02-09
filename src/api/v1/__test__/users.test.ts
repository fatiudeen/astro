import supertest from 'supertest';
import { logger } from '@utils/logger';
import App from '../app';
import AuthService from '../services/auth.service';

import { validUser, validUserUpdateData, validUser2, invalidUserId } from './__fixtures__/user';

logger.silent = true;

const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/users';
let userId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  await authService.createUser({ ...validUser });
  userId = (await authService.createUser({ ...validUser2 }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('users API', () => {
  describe(`GET ${baseUrl} ==========>>>>`, () => {
    describe('given the database is not empty', () => {
      it('should return 200, and an array of users', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.users).toEqual(expect.arrayContaining([expect.objectContaining({ _id: expect.any(String) })]));
      });
    });
  });

  describe(`GET ${baseUrl}/me ==========>>>>`, () => {
    describe('given a valid token ', () => {
      it('should get the user details and return 200', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/me`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toEqual(expect.objectContaining({ _id: expect.any(String), email: validUser.email }));
      });
    });
  });

  describe(`PUT ${baseUrl}/me ==========>>>>`, () => {
    describe('given a the user exists', () => {
      it('should add the slot return 200 and the user', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/me`)
          .set(authentication)
          .send({ ...validUserUpdateData });

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toEqual(
          expect.objectContaining({
            ...validUserUpdateData,
          }),
        );
      });
    });
  });

  describe(`DELETE ${baseUrl}/me ==========>>>>`, () => {
    describe('given a the user exists', () => {
      it('should add the slot return 200 and the user', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/me`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toEqual(expect.objectContaining({ _id: expect.any(String), email: validUser.email }));
      });
    });
  });

  describe(`GET ${baseUrl}/:userId ==========>>>>`, () => {
    describe('given user a valid userId', () => {
      it('should return 200 and user data', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${userId}`).set(authentication);
        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        // expect(body.data).toEqual(expect.arrayContaining([expect.any(Object)]));
      });
    });
  });

  describe(`PUT ${baseUrl}/:userId ==========>>>>`, () => {
    describe('given given the user exists and a valid update data', () => {
      it('should return 200 and the updated user', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/${userId}`)
          .set(authentication)
          .send({ ...validUserUpdateData });

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        // expect(body.data).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({ role: 'interviewer' }),
        //   ]),
        // );
      });
    });

    describe('given given the invalid user', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/${invalidUserId}`)
          .set(authentication)
          .send({ ...validUserUpdateData });

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
        // expect(body.data).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({ role: 'interviewer' }),
        //   ]),
        // );
      });
    });
  });

  describe(`DELETE ${baseUrl}/:userId ==========>>>>`, () => {
    describe('given a valid user', () => {
      it('should return 200 and the deleted user', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${userId}`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        // expect(body.data).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({ role: 'candidate' }),
        //   ]),
        // );
      });
    });

    describe('given a invalid user', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${invalidUserId}`).set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
        // expect(body.data).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({ role: 'candidate' }),
        //   ]),
        // );
      });
    });
  });
});
