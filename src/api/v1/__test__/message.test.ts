import supertest from 'supertest';
import App from '../app';
import MessageService from '../services/message.service';
import AuthService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';

import { validUser, invalidEmail, invalidPassword, validUser2 } from './data/user';
import { logger } from '@utils/logger';
import { invalidConversationId, invalidMessage, validMessage } from './data/message';

logger.silent = true;

const deepLog = (data: any) => {
  console.dir(data, { depth: null });
};

const messageService = new MessageService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
let baseUrl = '/api/v1/messages';
let conversationId: string;
let userId;
let userId2: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  userId2 = (await authService.createUser({ ...validUser2 }))._id;
  conversationId = (await messageService.createMessage({ ...validMessage, to: userId2, from: userId } as any)).convo
    ._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('MESSAGES ::', () => {
  describe(`POST ${baseUrl} ==========>>>>`, () => {
    describe('given a valid token, recipient and a non existent conversation', () => {
      it('should return 201, send a message and create a conversation', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...validMessage, to: userId2 });

        // deepLog(body);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token, recipient and existing conversation', () => {
      it('should return 201, send a message', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...validMessage, to: userId2 });

        //   deepLog(body)

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and an invalid recipient', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...invalidMessage });

        //   deepLog(body)

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });

  describe(`GET ${baseUrl}/:conversationId ==========>>>>`, () => {
    describe('given a valid token and existing conversationId, ', () => {
      it('should return 200 and an array of conversations', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${conversationId}`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(mailMock).toHaveBeenCalled();
      });
    });

    describe('given a valid token and no existing  messages in the conversation', () => {
      it('should return 200 and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${conversationId}`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and invalid conversation', () => {
      it('should return 200', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`${baseUrl}/${invalidConversationId}`)
          .set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toHaveLength(0);
      });
    });
  });
});
