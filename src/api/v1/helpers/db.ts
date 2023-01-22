import mongoose from 'mongoose';
import { MESSAGES } from '@config';
import { logger } from '@utils/logger';
import seeder from '@helpers/seeder';

export default async (connectionString: string) => {
  try {
    await mongoose.connect(connectionString);
    logger.info(MESSAGES.DB_CONNECTED);
    await seeder();
    logger.info(MESSAGES.ADMIN_SEEDED);
  } catch (error) {
    logger.error(error);
  }
};
