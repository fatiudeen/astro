import { MessageInterface } from '@interfaces/Messages.Interface';
import MessageRepository from '@repositories/Message.repository';
import Service from '@services/service';

class MessageService extends Service<MessageInterface, MessageRepository> {
  protected repository = new MessageRepository();
}

export default MessageService;
