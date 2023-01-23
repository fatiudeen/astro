/* eslint-disable import/first */
require('@config').optionsValidation();

import app from '@app';
import { logger } from '@utils/logger';
import { DB_URI, PORT, OPTIONS } from '@config';

(global as any).logger = logger;

if (OPTIONS.USE_SOCKETS) {
  app.io!.on('connection', (socket) => {
    logger.info(['socket connected', socket.id]);
  });
}

app.listen(<number>(<unknown>PORT), DB_URI);
