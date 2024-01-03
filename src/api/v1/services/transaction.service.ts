import { TransactionInterface } from '@interfaces/Transaction.Interface';
import TransactionRepository from '@repositories/Transaction.repository';
import Service from '@services/service';

class TransactionService extends Service<TransactionInterface, TransactionRepository> {
  protected repository = new TransactionRepository();
}

export default TransactionService;
