import app from '@app';
import { logger } from '@utils/logger';
import { DB_URI, PORT } from '@config';

(global as any).logger = logger;

app.listen(<number>(<unknown>PORT), <string>DB_URI);
