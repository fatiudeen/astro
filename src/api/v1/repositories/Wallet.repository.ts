import { WalletInterface } from '@interfaces/Wallet.Interface';
import Wallet from '@models/Wallet';
import Repository from '@repositories/repository';

export default class WalletRepository extends Repository<WalletInterface> {
  protected model = Wallet;
}
