import { Types } from 'mongoose';

export interface BankAccountInterface {
  name: string;
  number: number;
  bankName: number;
  bankCode: number;
}

export interface WalletInterface {
  userId: string | Types.ObjectId;
  balance: number;
  accounts: BankAccountInterface[];
}
