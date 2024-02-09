import supertest from 'supertest';
import { logger } from '@utils/logger';
import FollowService from '@services/follow.service';
import App from '../app';
import AuthService from '../services/auth.service';

import { validUser, validUser2, invalidUserId } from './__fixtures__/user';

logger.silent = true;

const followService = new FollowService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/follow';
let userId: string;
let userId2: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  userId2 = (await authService.createUser({ ...validUser2 }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('FOLLOW ::', () => {
  describe(`PUT ${baseUrl}/:userId/follow ==========>>>>`, () => {
    describe('given a valid token and a valid userId, ', () => {
      it('should follow and return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${userId}/follow`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an already followed user', () => {
      it('should unfollow user and return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${userId}/follow`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid user', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${invalidUserId}/follow`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/followers ==========>>>>`, () => {
    describe('given a valid token and user has more than zero followers', () => {
      it('should return 200 and a non empty array', async () => {
        await followService.create({ userId: userId2, followed: userId });

        const { statusCode, body } = await supertest(app).get(`${baseUrl}/followers`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.follows).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero followers', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/followers`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.follows).toHaveLength(0);
      });
    });
  });
  describe(`GET ${baseUrl}/following ==========>>>>`, () => {
    describe('given a valid token and user has more than zero following users', () => {
      it('should return 200 and a non empty array', async () => {
        await followService.create({ userId, followed: userId2 });

        const { statusCode, body } = await supertest(app).get(`${baseUrl}/following`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.follows).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero following users', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/following`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.follows).toHaveLength(0);
      });
    });
  });
});
