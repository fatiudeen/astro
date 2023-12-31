/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import { Server, Socket } from 'socket.io';
import ConversationService from '@services/conversation.service';
import { logger } from '@utils/logger';
import UserService from '@services/user.service';

export class SocketEvents {
  io: Server;
  //   socket;
  _conversationService = new ConversationService();
  _userService = new UserService();
  constructor(io: Server) {
    this.io = io;

    // this.socket = socket;
  }
  joinConversations = (socket: Socket) => {
    logger.info(socket.id);
    socket.emit('SPORT', 'welcome to SPORTBETZ');
    socket.on('register', (id: string) => {
      // logger.info(["joining room", provider._id]);
      this._conversationService

        .find({ recipients: [id] })
        .then((conversations) => {
          conversations.map((conversation) => {
            socket.join(conversation._id);
          });
          socket.emit('registered', 'registered');
        })
        .catch((error) => {
          socket.emit('error', error);
        });

      this._userService
        .update(id, { online: true, socketId: socket.id })
        .then((user) => {
          socket.emit('online', user);
          socket.join(user!.role);
        })
        .catch((error) => {
          socket.emit('error', error);
        });
    });
    socket.on('error', (error) => {
      logger.error(['error:', error]);
    });

    socket.on('connect_error', (error) => {
      logger.error(['connect_error:', error]);
    });

    socket.on('connect_failed', (error) => {
      logger.error(['connect_failed:', error]);
    });

    socket.on('disconnect', (reason) => {
      this._userService
        .update({ socketId: socket.id }, { online: false, socketId: '' })
        .then((user) => {
          socket.emit('offline', user);
        })
        .catch((error) => {
          socket.emit('error', error);
        });
      logger.info(['disconnect:', reason]);
    });
  };
}
