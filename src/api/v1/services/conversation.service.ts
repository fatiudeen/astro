/* eslint-disable no-underscore-dangle */
import { ConversationInterface } from '@interfaces/Conversation.Interface';
import ConversationRepository from '@repositories/Conversation.repository';
import Service from '@services/service';
import MessageService from '@services/message.service';
import UserService from '@services/user.service';

class ConversationService extends Service<ConversationInterface, ConversationRepository> {
  protected repository = new ConversationRepository();

  private readonly _messageService = Service.instance(MessageService);
  private readonly _userService = Service.instance(UserService);

  async fetch(id: string) {
    const convo = await this.repository.findRecipients(id);

    if (convo.length === 0) return [];

    return Promise.all(
      convo.map(async (val) => {
        const _count = await this._messageService().count({
          conversationId: val._id,
          seen: <any>{ $nin: [id] },
        });

        val.unreadMessages = _count;
        const x = val.recipients.filter((value) => {
          return value.toString() !== id.toString();
        });
        const user = await this._userService().findOne(x[0].toString());
        // if (!user) throw new HttpError('user error');
        if (!user) return val;
        // if (!user) {
        //   user = {} as any;
        //   user!.firstName = 'deleted';
        //   user!.lastName = 'user';
        // }
        val.alias = `${user!.firstName} ${user!.lastName}`;
        // val.aliasAvatar = user.avatar;
        // val.state = user.state;
        return val;
      }),
    );
  }
}

export default ConversationService;
