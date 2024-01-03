import { ConversationInterface } from '@interfaces/Conversation.Interface';
import Conversation from '@models/Conversation';
import Repository from '@repositories/repository';

export default class ConversationRepository extends Repository<ConversationInterface> {
  protected model = Conversation;

  findRecipients(id: string) {
    return new Promise<DocType<ConversationInterface>[]>((resolve, reject) => {
      const q = this.model.find().in('recipients', [id]).sort({ updatedAt: -1 });
      q.lean()
        .then((r) => {
          resolve(<DocType<ConversationInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
