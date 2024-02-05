import supertest from 'supertest';
import App from '../app';
import PostService from '../services/post.service';
import AuthService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';
import * as Config from '@config';

import { validUser } from './data/user';
import { logger } from '@utils/logger';
import { invalidPost, invalidSharedPost, validPost, validSharedPost, invalidPostId } from './data/post';

logger.silent = true;

const deepLog = (data: any) => {
  console.dir(data, { depth: null });
};

const postService = new PostService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
let baseUrl = '/api/v1/posts';
let postId: string;
let userId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  postId = (await postService.create({ ...validPost }))._id;
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('POSTS ::', () => {
  describe(`POST ${baseUrl} ==========>>>>`, () => {
    describe('given a valid post data create post, ', () => {
      it('should create post return 201', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...validPost });

        // deepLog(body);

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid post data', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...invalidPost });

        // deepLog(body);

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl} ==========>>>>`, () => {
    describe('given a valid token and user has more than zero posts', () => {
      it('should return 200 and a non empty array', async () => {
        await postService.create({ ...validPost, userId });
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        // deepLog(body);
        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.posts).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero posts', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.posts).toHaveLength(0);
      });
    });
  });
  describe(`PUT ${baseUrl}/share ==========>>>>`, () => {
    describe('given a valid token and a valid post', () => {
      it('should return 200 and a non empty array', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/share`)
          .set(authentication)
          .send({ ...validSharedPost, sharedPost: postId });

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and an invalid post', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`${baseUrl}/share`)
          .set(authentication)
          .send({ ...invalidSharedPost });

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/feeds ==========>>>>`, () => {
    describe('given a valid token', () => {
      it('should return 200 and an array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/feeds`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });
  });
  describe(`GET ${baseUrl}/:userId/users ==========>>>>`, () => {
    describe('given a valid token and the user has post', () => {
      it('should return 200 and a non empty array', async () => {
        await postService.create({ ...validPost, userId });
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${userId}/users`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.posts).toHaveLength(1);
      });
    });

    describe('given a valid token and user without post', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${userId}/users`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.posts).toHaveLength(0);
      });
    });
  });

  describe(`DELETE ${baseUrl}/:postId ==========>>>>`, () => {
    describe('given a valid token', () => {
      it('should return 200 and an array', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${postId}`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an valid token and an invalid post', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${invalidPostId}`).set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
});
