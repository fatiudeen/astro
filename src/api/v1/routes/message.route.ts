/* eslint-disable import/no-unresolved */
import MessageController from '@controllers/message.controller';
import { messageRequestDTO } from '@dtos/message.dto';
import Route from '@routes/route';
import { MessageInterface } from '@interfaces/Message.Interface';

export default class MessageRoute extends Route<MessageInterface> {
  controller = new MessageController('message');
  dto = messageRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .post(this.fileProcessor.uploadArray('attachment'), this.validator(this.dto.create), this.controller.create);
    this.router.route('/:conversationId').get(this.validator(this.dto.id), this.controller.get);

    return this.router;
  }
}
