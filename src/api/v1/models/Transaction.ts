import { model, Schema } from 'mongoose';
import { TransactionInterface } from '@interfaces/Transaction.Interface';

const transactionSchema = new Schema<TransactionInterface>(
  {
    success: Boolean,
    userId: String,
    amount: Number,
    date: String,
    description: String,
    reference: String,
    // customId: String,
  },
  {
    timestamps: true,
  },
);

// transactionSchema.plugin(customIdPlugin, { modelName: 'Transaction' });

export default model('Transaction', transactionSchema);
