import { WalletInterface, BankAccountInterface } from '@interfaces/Wallet.Interface';
import { model, Schema, Model } from 'mongoose';

const bankAccountSchema = new Schema<BankAccountInterface>(
  {
    name: String,
    number: String,
    bankName: String,
    bankCode: String,
  },
  {
    timestamps: true,
  },
);
const walletSchema = new Schema<WalletInterface>(
  {
    balance: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    accounts: [bankAccountSchema],
  },
  {
    timestamps: true,
  },
);

export default <Model<WalletInterface>>model('Wallet', walletSchema);
