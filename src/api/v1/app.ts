/* eslint-disable object-curly-newline */
import express, { Application } from 'express';
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
import AuthRoute from '@routes/auth.route';
import db from '@helpers/db';
import { logger } from '@utils/logger';
import { errorHandler } from '@middlewares/errorHandler';
import docs from '@middlewares/docs';
import UsersRoute from '@routes/user.route';
import * as Config from '@config';
import { rateLimiter } from '@middlewares/rateLimiter';
import Route from '@routes/route';
import EventRoute from '@routes/event.route';
import SubscriptionRoute from '@routes/subscription.route';
import session from 'express-session';
import BookmarkRoute from '@routes/bookmark.route';
import CommentRoute from '@routes/comment.route';
import ConversationRoute from '@routes/conversation.route';
import FollowRoute from '@routes/follow.route';
import LikeRoute from '@routes/like.route';
import MessageRoute from '@routes/message.route';
import PostRoute from '@routes/post.route';
import BetSlipRoute from '@routes/betSlip.route';
// import visitCount from '@middlewares/visitCount';

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
const MongoDBStore = require('connect-mongodb-session')(session);

class App {
  private app: Application;
  useSocket = Config.OPTIONS.USE_SOCKETS;
  useAnalytics = Config.OPTIONS.USE_ANALYTICS;
  io?: Server;
  private apiVersion = '/api/v1';
  private routes: Record<string, Route<any>> = {
    '': new AuthRoute(),
    events: new EventRoute(true),
    subscriptions: new SubscriptionRoute(true),
    users: new UsersRoute(true),
    bookmarks: new BookmarkRoute(true),
    comments: new CommentRoute(true),
    conversations: new ConversationRoute(true),
    follow: new FollowRoute(true),
    likes: new LikeRoute(true),
    messages: new MessageRoute(true),
    posts: new PostRoute(true),
    betSlips: new BetSlipRoute(true),
  };
  httpServer;
  constructor() {
    this.app = express();
    if (this.useSocket) {
      this.httpServer = createServer(this.app);
      this.io = new Server(this.httpServer, {
        cors: {
          origin: '*',
        },
      });
    }
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandlers();
  }

  private initRoutes() {
    if (Config.OPTIONS.USE_MULTER_DISK_STORAGE) {
      this.app.use(`${this.apiVersion}/${Config.MULTER_STORAGE_PATH}`, express.static(Config.CONSTANTS.ROOT_PATH));
    }
    Object.entries(this.routes).forEach(([url, route]) => {
      this.app.use(`${this.apiVersion}/${url}`, route.initRoutes());
    });
    this.app.use('/docs', docs);
    this.app.get('/', (_req, res) => {
      res
        .status(200)
        .json({ message: 'We both know you are not supposed to be here, but since you are, have a cup of coffee ☕' });
    });
  }
  private initMiddlewares() {
    this.app.use(
      cors({
        origin: ['*'],
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));
    // eslint-disable-next-line no-unused-vars
    this.app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));
    this.app.use(express.json());
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(mongoSanitize());
    this.app.use(compression());
    this.app.use(methodOverride());
    if (Config.NODE_ENV !== 'development') {
      this.app.use(`${this.apiVersion}`, rateLimiter);
    }
    if (Config.NODE_ENV !== 'test' && this.useAnalytics) {
      this.visitCount(Config.DB_URI);
    }
    if (this.useSocket) {
      this.app.use((req, res, next) => {
        req.io = this.io!;
        next();
      });
    }
  }

  private initErrorHandlers() {
    this.app.use(errorHandler);
    this.app.use('*', (req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });
  }

  private visitCount(connectionString: string) {
    const Session: session.SessionOptions = {
      secret: Config.JWT_KEY,
      resave: false,
      store: new MongoDBStore({
        uri: connectionString,
        collection: 'cookie_sessions',
      }),
      rolling: true,
      saveUninitialized: true,
      cookie: {
        // path: '/',
        httpOnly: false,
        sameSite: 'none',
        secure: false,
        // maxAge: 1000 * 60 * 5, // one minuit
      },
    };
    this.app.use(session(Session));
    // this.app.use(visitCount());
  }

  public listen(port: number, connectionString: string) {
    const server = this.useSocket ? this.httpServer! : this.app;

    db(connectionString);
    server.listen(port, () => {
      logger.info(`running on port ${port}`);
    });
  }

  public instance() {
    return this.app;
  }
}

export default App;
