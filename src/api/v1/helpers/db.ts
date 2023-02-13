import mongoose from 'mongoose';
import { MESSAGES, OPTIONS } from '@config';
import { logger } from '@utils/logger';
import seeder from '@helpers/seeder';

export default async (connectionString: string) => {
  try {
    mongoose.set('strictQuery', true);
    mongoose.connection.syncIndexes();

    await mongoose.connect(connectionString);
    logger.info(MESSAGES.DB_CONNECTED);
    if (OPTIONS.USE_ADMIN_SEED) {
      await seeder();
      logger.info(MESSAGES.ADMIN_SEEDED);
    }
  } catch (error) {
    logger.error([error]);
  }
};
