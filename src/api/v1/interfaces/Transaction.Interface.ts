// import { enumUtil } from "zod/lib/helpers/enumUtil";

import { TxnTypeEnum } from '@interfaces/Common.Interface';
import { Types } from 'mongoose';

export interface TransactionInterface {
  success: boolean;
  userId: string | Types.ObjectId;
  amount: number;
  type: TxnTypeEnum;
  description: string;
  reference: string;
  tags: string;
  date: string;
}
