import app from '@app';
import { logger } from '@utils/logger';
// eslint-disable-next-line object-curly-newline
import { DB_URI, PORT, optionsValidation, OPTIONS } from '@config';

(global as any).logger = logger;

if (OPTIONS.USE_SOCKETS) {
  app.io!.on('connection', (socket) => {
    logger.info(['socket connected', socket.id]);
  });
}

optionsValidation();
app.listen(<number>(<unknown>PORT), DB_URI);
