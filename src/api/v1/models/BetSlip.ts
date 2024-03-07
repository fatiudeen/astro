import { BetSlipInterface, GamesInterface, BetSlipOutcome } from '@interfaces/BetSlip.Interface';
import { model, Schema, Model } from 'mongoose';

const GamesSchema = new Schema<GamesInterface>(
  {
    odds: String,
    gameId: String,
    leagueId: String,
    market: String,
    outcome: String,
  },
  {
    timestamps: true,
  },
);

const betSlipSchema = new Schema<BetSlipInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    games: [GamesSchema],
    stake: Number,
    totalOdds: Number,
    startDate: String,
    endDate: String,
    completed: String,
    outcome: { type: String, enum: Object.values(BetSlipOutcome), default: BetSlipOutcome.PENDING },
  },
  {
    timestamps: true,
  },
);

export default <Model<BetSlipInterface>>model('BetSlip', betSlipSchema);
