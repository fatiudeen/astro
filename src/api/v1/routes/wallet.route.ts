/* eslint-disable import/no-unresolved */
import WalletController from '@controllers/wallet.controller';
import { walletRequestDTO } from '@dtos/wallet.dto';
import Route from '@routes/route';
import { WalletInterface } from '@interfaces/Wallet.Interface';

export default class WalletRoute extends Route<WalletInterface> {
  controller = new WalletController('wallet');
  dto = walletRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.controller.getOne);
    // this.router
    //   .route('/bank')
    //   .get(this.controller.getBank)
    //   .post(this.validator(this.dto.addBank), this.controller.addBank);
    // this.router.route('/bank/:accountId').delete(this.validator(this.dto.removeBank), this.controller.removeBank);
    // this.router
    //   .route('/bank/confirm')
    // .post(this.validator(this.dto.confirmAccount), this.controller.resolveAccountNumber);
    // this.router.route('/withdraw').post(this.validator(this.dto.withdraw), this.controller.withdraw);

    return this.router;
  }
}
