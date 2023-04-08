/* eslint-disable no-undef */
import supertest from 'supertest';
import App from '@app';

const instance = supertest(new App().instance());
describe('index test', () => {
  it('should return 200', async () => {
    const { statusCode, body } = await instance.get('/');

    expect(statusCode).toBe(200);
    expect(body.message).toEqual('WELCOME');
  });
});
