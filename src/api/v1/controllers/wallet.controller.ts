/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import WalletService from '@services/wallet.service';
import { WalletInterface } from '@interfaces/Wallet.Interface';
import Controller from '@controllers/controller';
// import { WalletResponseDTO } from '@dtos/wallet.dto';

class WalletController extends Controller<WalletInterface> {
  service = new WalletService();
  responseDTO = undefined; //WalletResponseDTO.Wallet;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <WalletInterface>req.body;
    const result = await this.service.update(params, data);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  delete = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.delete(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
}

export default WalletController;
