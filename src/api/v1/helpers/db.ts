import mongoose from 'mongoose';
import { CONSTANTS } from '@config';
import { logger } from '@ilerah/commons';

export default async (connectionString: string) => {
  try {
    await mongoose.connect(connectionString);
    logger.info(CONSTANTS.DB_CONNECTED);
  } catch (error) {
    logger.error(error);
  }
};
