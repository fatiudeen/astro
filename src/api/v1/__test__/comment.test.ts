import supertest from 'supertest';
import { logger } from '@utils/logger';
import PostService from '@services/post.service';
import App from '../app';
import CommentService from '../services/comment.service';
import AuthService from '../services/auth.service';

import { validUser } from './data/user';
import { invalidComment, invalidCommentId, validComment } from './data/comment';
import { invalidPostId, validPost } from './data/post';

logger.silent = true;

const postService = new PostService();
const commentService = new CommentService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/comments';
let postId: string;
let commentId: string;
let userId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  postId = (await postService.create({ ...validPost, userId }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  commentId = (await commentService.create({ ...validComment, postId, userId } as any))._id;
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('comments ::', () => {
  describe(`POST ${baseUrl} ==========>>>>`, () => {
    describe('given a valid post create comment, ', () => {
      it('should create comment return 201', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...validComment, postId });

        //   deepLog(body)

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid post', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}`)
          .set(authentication)
          .send({ ...invalidComment });

        // deepLog(body);

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/:commentId ==========>>>>`, () => {
    describe('given a valid token and an existing comment', () => {
      it('should return 200 and a non empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${commentId}`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and the comment does not exist', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${invalidCommentId}`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`DELETE ${baseUrl}/:postId ==========>>>>`, () => {
    describe('given a valid token and an existing comment', () => {
      it('should return 200 and the deleted comment', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${commentId}`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given a valid token and the comment does not exist', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).delete(`${baseUrl}/${invalidCommentId}`).set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/:postId/posts ==========>>>>`, () => {
    describe('given a valid token and an existing post with comments', () => {
      it('should return 200 and a non empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${postId}/posts`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.comments).toHaveLength(1);
      });
    });

    describe('given a valid token and an existing post without comments', () => {
      it('should return 200 and an empty array', async () => {
        const _postId = (await postService.create({ ...validPost, userId }))._id;
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${_postId}/posts`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.comments).toHaveLength(0);
      });
    });

    describe('given a valid token and the post does not exist', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${invalidPostId}/posts`).set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl}/:commentId/replies ==========>>>>`, () => {
    describe('given a valid token and an existing post with comments', () => {
      it('should return 200 and a non empty array', async () => {
        await commentService.createReply({ parentId: commentId, text: validComment.text, userId } as any);
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${commentId}/replies`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.comments).toHaveLength(1);
      });
    });

    describe('given a valid token and an existing comment without replies', () => {
      it('should return 200 and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(`${baseUrl}/${commentId}/replies`).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.comments).toHaveLength(0);
      });
    });

    describe('given a valid token and the comment does not exist', () => {
      it('should return 404, and an empty array', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`${baseUrl}/${invalidCommentId}/replies`)
          .set(authentication);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`POST ${baseUrl}/replies ==========>>>>`, () => {
    describe('given a valid comment create reply, ', () => {
      it('should create reply return 201', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}/replies`)
          .set(authentication)
          .send({ ...validComment, parentId: commentId, userId });

        //   deepLog(body)

        expect(statusCode).toBe(201);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid comment', () => {
      it('should return 400', async () => {
        const { statusCode, body } = await supertest(app)
          .post(`${baseUrl}/replies`)
          .set(authentication)
          .send({ ...invalidComment });

        //   deepLog(body)

        expect(statusCode).toBe(400);
        expect(body.success).toEqual(false);
      });
    });
  });
});
