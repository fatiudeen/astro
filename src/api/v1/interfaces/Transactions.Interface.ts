// import { enumUtil } from "zod/lib/helpers/enumUtil";

import { TxnTypeEnum } from '@interfaces/Common.Interface';

export interface TransactionsInterface {
  success: boolean;
  userId: string;
  amount: number;
  type: TxnTypeEnum;
  description: string;
  reference: string;
  tags: string;
}
