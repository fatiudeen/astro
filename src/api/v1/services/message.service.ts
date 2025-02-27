/* eslint-disable no-underscore-dangle */
import { MessageInterface } from '@interfaces/Message.Interface';
import MessageRepository from '@repositories/Message.repository';
import Service from '@services/service';
import ConversationService from '@services/conversation.service';
import { ConversationInterface } from '@interfaces/Conversation.Interface';
import UserService from '@services/user.service';
import HttpError from '@helpers/HttpError';
import { logger } from '@utils/logger';

class MessageService extends Service<MessageInterface, MessageRepository> {
  protected repository = new MessageRepository();
  private readonly _conversationService = Service.instance(ConversationService);
  private readonly _userService = Service.instance(UserService);

  async createMessage(data: MessageInterface) {
    if (!data.to) throw new HttpError('invalid recipient', 400);

    const _user = await this._userService().findOne(data.to.toString());
    if (!_user) throw new HttpError('invalid recipient', 400);
    let convo = await this._conversationService().findOne(<any>{
      $and: [{ recipients: data.to }, { recipients: data.from }],
    });

    const lastMessage = data.message ? data.message : (data.message = '');
    if (!convo) {
      convo = await this._conversationService().create({
        recipients: <ConversationInterface['recipients']>[data.to, data.from],
        lastMessage,
        alias: '',
        aliasAvatar: '',
        unreadMessages: 0,
      });
    } else {
      convo.lastMessage = lastMessage;
      await this._conversationService().update(convo._id, convo);
    }
    data.conversationId = convo._id;
    data.seen = [<string>data.from];
    // data.state =
    const message = await this.repository.create(data);
    return { message, convo };
  }

  find({ conversationId, userId }: { conversationId: string; userId: string }) {
    this.update(
      { conversationId, seen: <any>{ $nin: [userId] } },
      <any>{
        $addToSet: { seen: userId },
      },
      false,
      true,
    ).then((doc) => {
      logger.info(doc);
    });
    return this.repository.find({ conversationId });
  }

  seen(conversationId: string, userId: string) {
    return this.update(
      { conversationId, seen: <any>{ $nin: [userId] } },
      <any>{ $addToSet: { seen: userId } },
      false,
      true,
    );
  }
}

export default MessageService;
