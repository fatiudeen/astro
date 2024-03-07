import HttpError from '@helpers/HttpError';
import OddsJam from '@helpers/oddsJam';
import { GameOddsAPIParams, GamesAPIParams, Leagues, MarketsAPIParams } from '@interfaces/OddsJam.Interface';
import { BetSlipInterface } from '@interfaces/BetSlip.Interface';
import BetSlipRepository from '@repositories/BetSlip.repository';
import Service from '@services/service';

class BetSlipService extends Service<BetSlipInterface, BetSlipRepository> {
  protected repository = new BetSlipRepository();
  private oddsJamClient = OddsJam;

  sports() {
    return [
      'football',
      'basketball',
      'baseball',
      'mma',
      'boxing',
      'hockey',
      'soccer',
      'tennis',
      'golf',
      'motorsports',
      'esports',
    ] as const;
  }

  async leagues(
    sport:
      | 'football'
      | 'basketball'
      | 'baseball'
      | 'mma'
      | 'boxing'
      | 'hockey'
      | 'soccer'
      | 'tennis'
      | 'golf'
      | 'motorsports'
      | 'esports',
  ) {
    if (!sport || !this.sports().includes(sport)) {
      throw new HttpError('invalid sport', 400, { validSports: this.sports() });
    }
    return (<{ data: Leagues }>(<unknown>await this.oddsJamClient.getLeagues({ sport }))).data;
  }

  // page?: number;
  // sportsbook?: SportsBooks | SportsBooks[];
  // marketName?: string | string[];
  // sport?: Sports | Sports[];
  // league?: string | string[];
  // gameId?: string | string[];
  // isLive: isLiveOptions;
  // startDateBefore: string;
  // startDateAfter: string;
  async odds(
    sportsBook: string,
    // marketName: string,
    // sport: string,
    // league: string,
    gameId: string,
    isLive = false,
    // startDateBefore?: string,
    startDateAfter = new Date().toISOString(),
    page = 1,
  ) {
    if (!this.sportsBook().includes(sportsBook)) {
      throw new HttpError('invalid sports book');
    }
    const data = {
      page,
      sportsbook: sportsBook,
      // marketName,
      // sport,
      // league,
      game_id: gameId,
      isLive,
      // startDateBefore,
      startDateAfter,
    };

    return (await this.oddsJamClient.getGameOdds(data as unknown as GameOddsAPIParams)).data;
  }

  async market(gameId: string, sportsbook: string, isLive = false, page = 1) {
    const data = { page, game_id: gameId, sportsbook };
    if (isLive) {
      Object.assign(data, { isLive });
    }
    return (await this.oddsJamClient.getMarkets(data as MarketsAPIParams)).data;
  }
  sportsBook() {
    return [
      'Pinnacle',
      '5Dimes',
      'DraftKings',
      'BetMGM',
      'WynnBET',
      'theScore',
      'Bally Bet',
      'Elite Sportsbook',
      'FOX Bet',
      'FanDuel',
      'Points Bet',
      'Caesars',
      'Barstool',
      'Borgota',
      'Unibet',
      'BetRivers',
      'Wind Creek',
      'BetAnySports',
      'BookMaker',
      'SugarHouse',
      'TwinSpires',
      'BetUS',
      'bwin',
      'Betfred',
      'Betfair',
      'BetOnline',
      'Betway',
      'Bovada',
      'Bodog',
      'Casumo',
      '10Bet',
      '888 sport (Canada)',
      'MyBookie',
      'Betcris',
      'OddsJam',
    ];
  }

  async games(
    sport: string,
    league: string,
    isLive = false,
    // startDateBefore?: string,
    startDateAfter = new Date().toISOString(),
    page = 1,
  ) {
    if (!sport || !this.sports().includes(sport as any)) {
      throw new HttpError('invalid sport', 400, { validSports: this.sports() });
    }

    const leagues = await this.leagues(sport as any);
    if (!league || !leagues.includes(league)) {
      throw new HttpError('invalid league', 400, { validLeagues: leagues });
    }
    const data = { page, league, sport, startDateAfter };
    if (isLive) {
      Object.assign(data, { isLive });
    }
    return (await this.oddsJamClient.getGames(data as GamesAPIParams)).data;
  }

  // findOne(query: string | Partial<BetSlipInterface>): Promise<DocType<BetSlipInterface> | null> {
  //   return this.repository.findOne(query);
  // }
}

export default BetSlipService;
