import { MessageInterface } from '@interfaces/Messages.Interface';
import Message from '@models/Message';
import Repository from '@repositories/repository';

export default class MessageRepository extends Repository<MessageInterface> {
  protected model = Message;

  find(_query?: Partial<MessageInterface>) {
    return new Promise<DocType<MessageInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};

      const q = this.model.find(query).populate('from to').sort({ createdAt: -1 });
      q.lean()
        .then((r) => {
          resolve(<DocType<MessageInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
