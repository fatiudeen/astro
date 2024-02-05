/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import TransactionService from '@services/transaction.service';
import { TransactionInterface } from '@interfaces/Transaction.Interface';
import Controller from '@controllers/controller';
// import { TransactionResponseDTO } from '@dtos/transaction.dto';

class TransactionController extends Controller<TransactionInterface> {
  service = new TransactionService();
  responseDTO = undefined; // TransactionResponseDTO.Transaction;
  getOne = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;

    const result = await this.service.findOne(params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });
  update = this.control(async (req: Request) => {
    const params = req.params[this.resourceId] || req.user?._id!;
    const data = <TransactionInterface>req.body;
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

export default TransactionController;
