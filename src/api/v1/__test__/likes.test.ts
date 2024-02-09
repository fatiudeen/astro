import supertest from 'supertest';
import { logger } from '@utils/logger';
import PostService from '@services/post.service';
import CommentService from '@services/comment.service';
import App from '../app';
import AuthService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';

import { validUser } from './__fixtures__/user';
import { invalidPostId, validPost } from './__fixtures__/post';
import { invalidCommentId, validComment } from './__fixtures__/comment';

logger.silent = true;

const postService = new PostService();
const commentService = new CommentService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/likes';
let postId: string;
let commentId: string;
let userId;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  authentication = { Authorization: `Bearer ${user.token}` };
  postId = (await postService.create({ ...validPost, userId }))._id;
  commentId = (await commentService.create({ ...validComment, postId } as any))._id;
});

describe('LIKES ::', () => {
  describe('=== POSTS ===', () => {
    describe(`PUT ${baseUrl}/:postId:post ==========>>>>`, () => {
      describe('given a valid post create a like, ', () => {
        it('should create like return 200', async () => {
          const { statusCode, body } = await supertest(app).put(`${baseUrl}/${postId}/post`).set(authentication);

          //   deepLog(body)

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });

      describe('given an already liked post', () => {
        it('should return 200', async () => {
          const { statusCode, body } = await supertest(app).put(`${baseUrl}/${postId}/post`).set(authentication);

          //   deepLog(body)

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });

      describe('given an invalid post', () => {
        it('should return 400', async () => {
          const { statusCode, body } = await supertest(app).put(`${baseUrl}/${invalidPostId}/post`).set(authentication);

          // deepLog(body);

          expect(statusCode).toBe(404);
          expect(body.success).toEqual(false);
        });
      });
    });
    describe(`GET ${baseUrl}/:postId/post ==========>>>>`, () => {
      describe('given a valid token and post has more than zero likes', () => {
        it('should return 200 and a non empty array', async () => {
          const { statusCode, body } = await supertest(app).get(`${baseUrl}/${postId}/post`).set(authentication);

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });

      describe('given a valid token and post has zero likes', () => {
        it('should return 200, and an empty array', async () => {
          const { statusCode, body } = await supertest(app).get(`${baseUrl}/${postId}/post`).set(authentication);

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });
    });
  });
  describe('=== COMMENTS ===', () => {
    describe(`PUT ${baseUrl}/:commentId/comment ==========>>>>`, () => {
      describe('given a valid comment create a like', () => {
        it('should create like return 200', async () => {
          const { statusCode, body } = await supertest(app).put(`${baseUrl}/${commentId}/comment`).set(authentication);

          //   deepLog(body)

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
          expect(mailMock).toHaveBeenCalled();
        });
      });

      describe('given an already liked comment', () => {
        it('should return 200', async () => {
          const { statusCode, body } = await supertest(app).put(`${baseUrl}/${commentId}/comment`).set(authentication);

          //   deepLog(body)

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });

      describe('given an invalid comment', () => {
        it('should return 400', async () => {
          const { statusCode, body } = await supertest(app)
            .put(`${baseUrl}/${invalidCommentId}/comment`)
            .set(authentication);

          // deepLog(body);

          expect(statusCode).toBe(404);
          expect(body.success).toEqual(false);
        });
      });
    });
    describe(`GET ${baseUrl}/:commentId/comment ==========>>>>`, () => {
      describe('given a valid token and comment has more than zero likes', () => {
        it('should return 200 and a non empty array', async () => {
          const { statusCode, body } = await supertest(app).get(`${baseUrl}/${commentId}/comment`).set(authentication);

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });

      describe('given a valid token and comment has zero likes', () => {
        it('should return 200, and an empty array', async () => {
          const { statusCode, body } = await supertest(app).get(`${baseUrl}/${commentId}/comment`).set(authentication);

          expect(statusCode).toBe(200);
          expect(body.success).toEqual(true);
        });
      });
    });
  });
});
