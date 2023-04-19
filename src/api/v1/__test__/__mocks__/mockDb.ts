import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JWT_KEY } from '@config';

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_KEY;

  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
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

jest.setTimeout(30000);
