/* eslint-disable no-undef */
import supertest from 'supertest';
import App from '@app';

const instance = supertest(new App().instance());
describe('GET /', () => {
  it('should return 200', async () => {
    const { statusCode, body } = await instance.get('/');

    expect(statusCode).toBe(200);
    expect(body.message).toEqual(
      'We both know you are not supposed to be here, but since you are, have a cup of coffee ☕',
    );
  });
});

describe('GET /non/existent/route', () => {
  it('should return 404', async () => {
    const { statusCode, body } = await instance.get('/non/existent/route');

    expect(statusCode).toBe(404);
    expect(body.message).toEqual('Route not found');
  });
});
