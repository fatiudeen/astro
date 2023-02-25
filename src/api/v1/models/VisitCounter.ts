import mongoose from 'mongoose';
import { VisitCounterInterface } from '@interfaces/VisitCounter.Interface';

const VisitCounterSchema = new mongoose.Schema<VisitCounterInterface>(
  {
    date: String,
    registered: mongoose.Schema.Types.Mixed,
    unregistered: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('visitCounter', VisitCounterSchema);
