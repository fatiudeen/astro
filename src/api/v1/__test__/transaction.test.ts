import supertest from 'supertest';
import app from '../app';
import authService from '../services/auth.service';
import mailMock from './__mocks__/mailMock';
import { prismaMock } from './__mocks__/singleton';
import { userData, txnData } from './__mocks__/testdata';
import { user } from './__mocks__/testdata';

let token = '';

beforeEach(async () => {
  await authService.signUp(user);
  await authService.login(user);
  const otp = mailMock.mock.calls[0][1].split(' ').pop();
  const data = await authService.verifyOtp(otp as unknown as number);

  token = data.token;
});

describe('tansactions', () => {
  describe('get all tansactions', () => {
    describe('given the transaction table is not empty', () => {
      it('should return 201 and array of transactions', async () => {
        // prismaMock.electricityPurchase.findMany.mockResolvedValue([txnData]);

        const { statusCode, body } = await supertest(app)
          .get('/api/v1/txn')
          .set({ Authorization: `Bearer ${token}` });

        expect(statusCode).toBe(201);
        // expect(body.data).toEqual(expect.arrayContaining[txnData]);
      }, 10000);
    });
  });

  describe('get one tansactions', () => {
    describe('given the transaction exists', () => {
      it('should return 201 and a transaction', async () => {
        const id = 3;
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/${id}`)
          .set({ Authorization: `Bearer ${token}` });

        expect(statusCode).toBe(201);
        // expect(body.data.Id).toMatchObject(txnData.Id);
      });
    });
  });
  describe('change transaction status', () => {
    describe('given the transaction exists', () => {
      it('should return 201 and a transaction', async () => {
        const id = 5,
          status: 1 | 2 | 3 | 4 = 4;
        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/txn/${id}/${status}`)
          .set({ Authorization: `Bearer ${token}` });

        expect(statusCode).toBe(201);
      });
    });
  });
  describe('send mail', () => {
    const message = {
      message: 'to deen',
    };
    describe('send mail to a single user', () => {
      it('should return 201', async () => {
        const id = 6;
        const { statusCode, body } = await supertest(app)
          .post(`/api/v1/txn/mail/${id}`)
          .send(message)
          .set({ Authorization: `Bearer ${token}` });

        expect(mailMock).toHaveBeenCalled();

        expect(statusCode).toBe(201);
      });
      describe('send mail to all users', () => {
        it('should return 201', async () => {
          const { statusCode, body } = await supertest(app)
            .post(`/api/v1/txn/mail/`)
            .send({
              ...message,
              emailAddresses: ['mailtoayuba@gmail.com', 'test@gmail.com'],
              sendToAllUsers: 'false',
              subject: 'tset',
            })
            .set({ Authorization: `Bearer ${token}` });
          expect(mailMock).toHaveBeenCalled();

          expect(statusCode).toBe(201);
        });
      });
    });
  });

  describe('get previous tansactions', () => {
    describe('given the user exists', () => {
      it('should return 201 and array of transactions', async () => {
        const id = 0;
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/previous/${id}`)
          .set({ Authorization: `Bearer ${token}` });

        expect(statusCode).toBe(201);
      });
    });
  });
  describe('tansaction state', () => {
    it('should return 201 and array of transactions', async () => {
      const { statusCode, body } = await supertest(app)
        .get(`/api/v1/txn/state`)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toBe(201);
    });
    it('should return 201 and array of successful transactions', async () => {
      const { statusCode, body } = await supertest(app)
        .get(`/api/v1/txn/state/1`)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toBe(201);
    });
    it('should return 201 and array of failed transactions', async () => {
      const { statusCode, body } = await supertest(app)
        .get(`/api/v1/txn/state/2`)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toBe(201);
    });
    it('should return 201 and array of pending transactions', async () => {
      const { statusCode, body } = await supertest(app)
        .get(`/api/v1/txn/state/3`)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toBe(201);
    });

    describe('given a time id and a first attempt flag', () => {
      it('should return 201 and array of transactions on the same day', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/state/m/1`)
          .set({ Authorization: `Bearer ${token}` });

        expect(statusCode).toBe(201);
      });
      it('should return 201 and array of transactions for the past 5 weeks', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/state/m/2`)
          .set({ Authorization: `Bearer ${token}` });
        expect(statusCode).toBe(201);
      });
      it('should return 201 and array of transactions for the past 12 months', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/state/m/3`)
          .set({ Authorization: `Bearer ${token}` });
        expect(statusCode).toBe(201);
      });
      it('should return 201 and array of transactions successful on first attempt for the past 12 months', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/state/3?firstattempt=true`)
          .set({ Authorization: `Bearer ${token}` });
        expect(statusCode).toBe(201);
      });
    });
  });
  // const reference = '',
  //   amount = '';
  // describe('retry tansactions', () => {
  //   describe('given the transaction exists', () => {
  //     it('should return 201', async () => {
  //       const { statusCode, body } = await supertest(app).get(
  //         `/api/v1/txn/retry${reference}`
  //       );
  //       expect(statusCode).toBe(201);
  //     });
  //   });
  // });
  // describe('refund tansactions', () => {
  //   describe('given the transaction exists', () => {
  //     it('should return 201 and wallet balance', async () => {
  //       const { statusCode, body } = await supertest(app)
  //         .post(`/api/v1/txn/refund/${reference}`)
  //         .send({ amount });
  //       expect(statusCode).toBe(201);
  //     });
  //   });
  // });
  describe('get logs', () => {
    describe('given the transaction exists', () => {
      it('should return 201 and array of archived transactions', async () => {
        const { statusCode, body } = await supertest(app)
          .get(`/api/v1/txn/log`)
          .set({ Authorization: `Bearer ${token}` });
        expect(statusCode).toBe(201);
      });
    });
  });
});
