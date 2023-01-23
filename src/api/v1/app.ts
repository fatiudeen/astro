import express, { Application, Request } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import authRoute from '@routes/auth.route';
import db from '@helpers/db';
import { logger } from '@utils/logger';
import { errorHandler } from '@middlewares/errorHandler';
import docs from '@middlewares/docs';
import userRoute from '@routes/user.route';
import { OPTIONS } from '@config';

class App {
  private app: Application;
  useSocket = OPTIONS.USE_SOCKETS;
  io?: Server;
  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandlers();
  }

  private initRoutes() {
    this.app.use('/docs', docs);
    this.app.use('/auth', authRoute.initRoutes());
    this.app.use('/users', userRoute.initRoutes());
    this.app.get('/', (req, res) => {
      res.status(200).json({ msg: 'WELCOME TO DTMS :)' });
    });
  }
  private initMiddlewares() {
    this.app.use(
      cors({
        origin: ['*'],
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    // eslint-disable-next-line no-unused-vars
    this.app.use((req, res, next) => {
      req.headers.user ? (req.user = JSON.parse(<string>req.headers.user)) : undefined;
      next();
    });
  }

  private initErrorHandlers() {
    this.app.use(errorHandler);
    this.app.use('*', (req, res) => {
      res.status(404).json({ msg: 'Route not found' });
    });
  }

  private initSocket() {
    // const app = express();
    const httpServer = createServer(this.app);
    const io = new Server(httpServer, {
      /* options */
    });
    this.app.use((req: Request) => {
      req.io = io;
    });
    this.io = io;

    return httpServer;
  }

  public listen(port: number, connectionString: string) {
    let server;
    if (this.useSocket) {
      server = this.initSocket();
    } else server = this.app;

    db(connectionString);
    server.listen(port, () => {
      logger.info(`running on port ${port}`);
    });
  }

  public instance() {
    return this.app;
  }
}

export default new App();
