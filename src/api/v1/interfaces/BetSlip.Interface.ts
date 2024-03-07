/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import { Types } from 'mongoose';

export enum BetSlipOutcome {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  LOST = 'lost',
  WON = 'won',
}

// export interface SelectionInterface {
//   id: string;
//   odds: string;
//   homeTeam: string;
//   awayTeam: string;
//   isLive: boolean;
//   marketName: string;
//   league: string;
//   price: string;
//   outcome: BetSlipOutcome;
// }

export interface BetSlipInterface {
  // slip
  userId: string | Types.ObjectId;
  // games: SelectionInterface[];
  games: any[];
  stake: number;
  totalOdds: number;
  // startDate: string;
  // endDate: string;
  completed: boolean;
  outcome: BetSlipOutcome;
}
