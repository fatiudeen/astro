import supertest from 'supertest';
import { logger } from '@utils/logger';
import MessageService from '@services/message.service';
import App from '../app';
import AuthService from '../services/auth.service';

import { validUser, validUser2 } from './__fixtures__/user';
import { validMessage } from './__fixtures__/message';

logger.silent = true;

const messageService = new MessageService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/conversations';
let userId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('conversations ::', () => {
  describe(`GET ${baseUrl} ==========>>>>`, () => {
    describe('given a valid token and existing  conversations, ', () => {
      it('should return 200 and an array of conversations', async () => {
        const userId2 = (await authService.createUser({ ...validUser2 }))._id;
        await messageService.createMessage({ ...validMessage, to: userId2, from: userId } as any);
        const { statusCode, body } = await supertest(app).get(`${baseUrl}`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toHaveLength(1);
      });
    });

    describe('given a valid token and no existing  conversations', () => {
      it('should return 200 and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.data).toHaveLength(0);
      });
    });
  });
});
