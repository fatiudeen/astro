import supertest from 'supertest';
import { logger } from '@utils/logger';
import SubscriptionService from '@services/subscription.service';
import App from '../app';
import AuthService from '../services/auth.service';
import { invalidUserId, validUser, validUser2 } from './__fixtures__/user';
// import deepLog from '@utils/deepLog';
// import // validSubscription,
// invalidSubscription,
// validSubscriptionUpdateData,
// invalidSubscriptionId,
// './__fixtures__/subscription';

logger.silent = true;

const authService = new AuthService();
const subscriptionService = new SubscriptionService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/subscriptions';
let userId: string;
let userId2: string;
// let subscriptionId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  // await authService.createUser({ ...validUser });
  userId = (await authService.createUser({ ...validUser }))._id;
  userId2 = (await authService.createUser({ ...validUser2 }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };

  // subscriptionId = (await subscriptionService.create({ ...validSubscription } as any))._id;
});

describe('SUBSCRIBERS ::', () => {
  describe(`PUT ${baseUrl}/:userId/subscribe ==========>>>>`, () => {
    describe('given a valid token and a valid userId, ', () => {
      it('should subscribers and return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${userId}/subscribe`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an already subscribed user', () => {
      it('should unsubscribe user and return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${userId}/subscribe`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid user', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/${invalidUserId}/subscribe`)
          .set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/subscribers ==========>>>>`, () => {
    describe('given a valid token and user has more than zero subscribers', () => {
      it('should return 200 and a non empty array', async () => {
        await subscriptionService.create({ userId: userId2, subscribed: userId });

        const { statusCode, body } = await supertest(app).get(`${baseUrl}/subscribers`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.subscriptions).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero subscribers', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/subscribers`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.subscriptions).toHaveLength(0);
      });
    });
  });
  describe(`GET ${baseUrl}/subscribed ==========>>>>`, () => {
    describe('given a valid token and user has more than zero subscribed users', () => {
      it('should return 200 and a non empty array', async () => {
        await subscriptionService.create({ userId, subscribed: userId2 });

        const { statusCode, body } = await supertest(app).get(`${baseUrl}/subscribed`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.subscriptions).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero subscribed users', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/subscribed`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.subscriptions).toHaveLength(0);
      });
    });
  });
});
