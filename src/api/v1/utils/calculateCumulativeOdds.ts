import * as oddslib from 'oddslib';

export default (_bets: Array<number>, _stake: string) => {
  const bets = _bets; // .map((bet) => parseInt(bet, 10));
  const stake = parseFloat(_stake);
  const totalOdds = bets.reduce((acc, bet) => {
    return acc * oddslib.from('moneyline', bet).to('decimal'); // Convert positive odds to decimal
  }, 1);
  const payout = (totalOdds - 1) * stake;
  const moneyLineOdds = oddslib.from('decimal', totalOdds).to('moneyline');
  return { payout: payout.toFixed(2), totalOdds: moneyLineOdds.toFixed() };
};
