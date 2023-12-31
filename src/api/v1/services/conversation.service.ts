import { ConversationInterface } from '@interfaces/Conversation.Interface';
import ConversationRepository from '@repositories/Conversation.repository';
import Service from '@services/service';

class ConversationService extends Service<ConversationInterface, ConversationRepository> {
  protected repository = new ConversationRepository();
}

export default ConversationService;
