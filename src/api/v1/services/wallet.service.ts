import { WalletInterface } from '@interfaces/Wallet.Interface';
import WalletRepository from '@repositories/Wallet.repository';
import Service from '@services/service';

class WalletService extends Service<WalletInterface, WalletRepository> {
  protected repository = new WalletRepository();
}

export default WalletService;
