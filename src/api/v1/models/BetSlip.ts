import { BetSlipInterface, BetSlipOutcome } from '@interfaces/BetSlip.Interface';
import { model, Schema, Model } from 'mongoose';

// const GamesSchema = new Schema<GamesInterface>(
//   {
//     odds: String,
//     gameId: String,
//     leagueId: String,
//     market: String,
//     outcome: String,
//   },
//   {
//     timestamps: true,
//   },
// );

const betSlipSchema = new Schema<BetSlipInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    games: [Schema.Types.Mixed],
    stake: Number,
    totalOdds: Number,
    // startDate: String,
    // endDate: String,
    completed: { type: Boolean, default: false },
    outcome: { type: String, enum: Object.values(BetSlipOutcome), default: BetSlipOutcome.PENDING },
  },
  {
    timestamps: true,
  },
);

export default <Model<BetSlipInterface>>model('BetSlip', betSlipSchema);
