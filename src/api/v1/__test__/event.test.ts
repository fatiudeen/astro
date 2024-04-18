import supertest from 'supertest';
import { logger } from '@utils/logger';
import EventService from '@services/event.service';
import App from '../app';
import AuthService from '../services/auth.service';
import { validUser } from './__fixtures__/user';
import { validEvent, invalidEvent, validEventUpdateData, invalidEventId } from './__fixtures__/event';

logger.silent = true;

const authService = new AuthService();
const eventService = new EventService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/events';
// let userId: string;
let eventId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  await authService.createUser({ ...validUser });
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
  eventId = (await eventService.create({ ...validEvent } as any))._id;
});

describe(`${'event'.toUpperCase()} ::`, () => {
  describe(`POST ${baseUrl} ==========>>>>`, () => {
    describe('given a valid event create a event, ', () => {
      it('should create event return 200', async () => {
        const { statusCode, body } = await supertest(app)
          .post(baseUrl)
          .set(authentication)
          .send({ ...validEvent });

        //   deepLog(body)

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid event', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .post(baseUrl)
          .set(authentication)
          .send({ ...invalidEvent });

        // deepLog(body);

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl} ==========>>>>`, () => {
    describe('given a valid token and events exists', () => {
      it('should return 200 and a non empty array', async () => {
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe(`GET ${baseUrl}/:eventId ==========>>>>`, () => {
    describe('given a valid token a valid eventId', () => {
      it('should return 200 and a ', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${eventId}`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and an invalid eventId', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${invalidEventId}`).set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`PUT ${baseUrl}/:eventId ==========>>>>`, () => {
    describe('given a valid token a valid eventId', () => {
      it('should update and return 200 and a ', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/${eventId}`)
          .set(authentication)
          .send({ ...validEventUpdateData });

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe(`DELETE ${baseUrl}/:eventId ==========>>>>`, () => {
    describe('given a valid token a valid eventId', () => {
      it('should delete and return 200 and a ', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${eventId}`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });
  });
});
