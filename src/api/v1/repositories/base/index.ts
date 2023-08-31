import { OPTIONS } from '@config';
import { MongooseRepository } from './MongooseRepository';

export default OPTIONS.USE_DATABASE ? MongooseRepository : class {};
