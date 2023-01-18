import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import config from '../../../../config/config';

beforeAll(async () => {
  process.env.JWT_SECRET = <string>config.jwtkey;

  const mongoserver = await MongoMemoryServer.create();
  await mongoose.connect(mongoserver.getUri());
}, 10000);

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});
jest.mock('axios');
// export const PM = jest.mock('@prisma/client', ()=>{
//   return {
//     PrismaClient: function() {
//       return {
//         electricityPurchase: {
//           findMany: jest.fn(),
//           // update: jest.fn(),
//         },
//       };
//     },
//   };
// });
