import { MessageInterface } from '@interfaces/Message.Interface';
import Message from '@models/Message';
import Repository from '@repositories/repository';

export default class MessageRepository extends Repository<MessageInterface> {
  protected model = Message;

  find(_query?: Partial<MessageInterface>) {
    return new Promise<DocType<MessageInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};

      const q = this.model.find(query).sort({ createdAt: -1 });
      q.populate('from', 'username avatar firstName lastName');
      q.populate('to', 'username avatar firstName lastName');
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
