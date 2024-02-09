import supertest from 'supertest';
import { logger } from '@utils/logger';
import PostService from '@services/post.service';
import App from '../app';
import BookmarkService from '../services/bookmark.service';
import AuthService from '../services/auth.service';

import { validUser } from './__fixtures__/user';
import { invalidPostId, validPost } from './__fixtures__/post';

logger.silent = true;

const postService = new PostService();
const bookmarkService = new BookmarkService();
const authService = new AuthService();
const app = new App().instance();

let authentication: object;
const baseUrl = '/api/v1/bookmarks';
let postId: string;
let userId: string;

beforeEach(async () => {
  jest.clearAllMocks();
  userId = (await authService.createUser({ ...validUser }))._id;
  const user = await authService.login({ username: validUser.email, password: validUser.password });
  postId = (await postService.create({ ...validPost }))._id;
  authentication = { Authorization: `Bearer ${user.token}` };
});

describe('BOOKMARK ::', () => {
  describe(`PUT ${baseUrl}/:postId ==========>>>>`, () => {
    describe('given a valid post create bookmark, ', () => {
      it('should create bookmark return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${postId}`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an already bookmarked post', () => {
      it('should return 200', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${postId}`).set(authentication);

        //   deepLog(body)

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
      });
    });

    describe('given an invalid post', () => {
      it('should return 404', async () => {
        const { statusCode, body } = await supertest(app).put(`${baseUrl}/${invalidPostId}`).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(404);
        expect(body.success).toEqual(false);
      });
    });
  });
  describe(`GET ${baseUrl} ==========>>>>`, () => {
    describe('given a valid token and user has more than zero bookmarks', () => {
      it('should return 200 and a non empty array', async () => {
        await bookmarkService.create({ userId, postId });
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        // deepLog(body);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.bookmarks).toHaveLength(1);
      });
    });

    describe('given a valid token and user has zero bookmarks', () => {
      it('should return 200, and an empty array', async () => {
        const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);

        expect(statusCode).toBe(200);
        expect(body.success).toEqual(true);
        expect(body.bookmarks).toHaveLength(0);
      });
    });
  });
});
