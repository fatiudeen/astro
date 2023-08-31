import mongoose from 'mongoose';
import { MESSAGES, OPTIONS } from '@config';
import { logger } from '@utils/logger';
import seeder from '@helpers/seeder';
import { DataSource, EntitySchema } from 'typeorm';

const db =
  OPTIONS.USE_DATABASE === 'mongodb'
    ? async (connectionString: string) => {
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
      }
    : async (entities: EntitySchema<any>[]) => {
        try {
          const AppDataSource = new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'root',
            password: 'admin',
            database: 'test',
            entities,
            synchronize: true,
            logging: false,
          });

          await AppDataSource.initialize();
          return AppDataSource;
        } catch (error) {
          logger.error([error]);
        }
      };
export default db;
