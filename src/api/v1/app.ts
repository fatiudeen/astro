/* eslint-disable object-curly-newline */
import express, { Application, Request } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import methodOverride from 'method-override';
import authRoute from '@routes/auth.route';
import db from '@helpers/db';
import { logger } from '@utils/logger';
import { errorHandler } from '@middlewares/errorHandler';
import docs from '@middlewares/docs';
import userRoute from '@routes/user.route';
import { CONSTANTS, MULTER_STORAGE_PATH, NODE_ENV, OPTIONS } from '@config';
import { rateLimiter } from '@middlewares/rateLimiter';
import Route from '@routes/route';

class App {
  private app: Application;
  useSocket = OPTIONS.USE_SOCKETS;
  io?: Server;
  private apiVersion = '/api/v1';
  private routes: Record<string, Route<any>> = {
    '': authRoute,
    users: userRoute,
  };
  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandlers();
  }

  private initRoutes() {
    if (OPTIONS.USE_MULTER_DISK_STORAGE) {
      this.app.use(
        `${this.apiVersion}/${MULTER_STORAGE_PATH}`,
        express.static(CONSTANTS.ROOT_PATH),
      );
    }
    Object.entries(this.routes).forEach(([url, route]) => {
      this.app.use(`${this.apiVersion}/${url}`, route.initRoutes());
    });
    this.app.use('/docs', docs);
    this.app.get('/', (req, res) => {
      res.status(200).json({ msg: 'WELCOME TO API :)' });
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
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(mongoSanitize());
    this.app.use(compression());
    this.app.use(methodOverride());
    if (NODE_ENV !== 'development') {
      this.app.use(`${this.apiVersion}`, rateLimiter);
    }
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
