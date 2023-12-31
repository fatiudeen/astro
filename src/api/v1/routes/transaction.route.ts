/* eslint-disable import/no-unresolved */
import TransactionController from '@controllers/transaction.controller';
import { transactionRequestDTO } from '@dtos/transaction.dto';
import Route from '@routes/route';
import { TransactionInterface } from '@interfaces/Transaction.Interface';

export default class TransactionRoute extends Route<TransactionInterface> {
  controller = new TransactionController('transaction');
  dto = transactionRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.authorize(), this.controller.get);
    // .post(this.authorize(), this.validator(this.dto.init), this.controller.init);
    this.router.route('/:transactionId').get(this.authorize(), this.controller.getOne);
    // this.router.route('/d5da6687-2046-4a33-a724-82a29c61f1c6').post(this.controller.webhook);

    return this.router;
  }
}
